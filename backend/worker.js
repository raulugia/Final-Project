const Queue = require("bull");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const { PrismaClient } = require("@prisma/client");
const { redisConfig, cloudinaryConfig } = require("./config");

const imageQueue = new Queue("image-processing", { redis: redisConfig });

//configure cloudinary
cloudinary.config(cloudinaryConfig);

//
const prisma = new PrismaClient();

console.log("Image processing worker started...");

//process images
imageQueue.process(async (job) => {
  const { filePath, mealId } = job.data;

  try {
    console.log(`Processing job for meal ID: ${mealId}`);
    //read the original image
    const imageBuffer = await sharp(filePath).toBuffer();

    //create a thumbnail in memory
    const thumbnailBuffer = await sharp(imageBuffer).resize(200).toBuffer()

    //upload original image and thumbnail to cloudinary
    const [originalUpload, thumbnailUpload] = await Promise.all([
      cloudinary.uploader.upload_stream({ resource_type: "image"}, (error, result) => {
        if(error) throw error
        return result
      }).end(imageBuffer),
      cloudinary.uploader.upload_stream({ resource_type: "image"}, (error, result) => {
        if(error) throw error
        return result
      }).end(thumbnailBuffer),
    ]);

    console.log(`Uploaded imaged for meal id: ${mealId}`);

    //update meal log in the database with the cloudinary urls
    await prisma.mealLog.update({
      where: { id: mealId },
      data: {
        picture: originalUpload.secure_url,
        thumbnail: thumbnailUpload.secure_url,
      },
    });
  } catch (err) {
    console.error(`Failed to process job for meal ID: ${mealId}`, err);
  }
});
