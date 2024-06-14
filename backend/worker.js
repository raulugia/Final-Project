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
  console.log(`Processing job for meal ID: ${mealId}`);

  try {
    //create a thumbnail
    const thumbnailPath = `thumbnails/${filePath}`;
    await sharp(filePath).resize(200).toFile(thumbnailPath);

    //upload original image and thumbnail to cloudinary
    const [originalUpload, thumbnailUpload] = await Promise.all([
      cloudinary.uploader.upload(filePath),
      cloudinary.uploader.upload(thumbnailPath),
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
