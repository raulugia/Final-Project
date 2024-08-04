const Queue = require("bull");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const { PrismaClient } = require("@prisma/client");
const { redisConfig, cloudinaryConfig } = require("./config");

//initialize a new queue to process images with redis configuration
const imageQueue = new Queue("image-processing", { redis: redisConfig });
//
const imageUpdateQueue = new Queue("image-update", { redis: redisConfig })
//
const profilePictureQueue = new Queue("profile-picture-update", { redis: redisConfig })

//configure cloudinary
cloudinary.config(cloudinaryConfig);

//initialize the prisma client to interact with the database
const prisma = new PrismaClient();

console.log("Image processing worker started...");

//helper function to upload an image buffer to Cloudinary and return a promise
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        //create an upload stream
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image"}, 
            (error, uploadResult) => {
            //reject the promise if there is an error
            if(error) {
                return reject(error)
                }
            //resolve the promise with the result of the upload    
            resolve(uploadResult)
        });
        //end the stream and send the buffer
        uploadStream.end(buffer);
    })
}

//process images in the queue
imageQueue.process(async (job) => {
  //get the file path and the meal id from the job data  
  const { filePath, mealId } = job.data;

  try {
    console.log(`Processing job for meal ID: ${mealId}`);
    //read the original image into a buffer
    const imageBuffer = await sharp(filePath).toBuffer();
    //create a thumbnail from the original image buffer
    const thumbnailBuffer = await sharp(imageBuffer).resize(200).toBuffer()

    //upload both the original image and the thumbnail to Cloudinary
    const [originalUpload, thumbnailUpload] = await Promise.all([
        uploadToCloudinary(imageBuffer),
        uploadToCloudinary(thumbnailBuffer),
    ])

    //update meal log in the database with the Cloudinary urls
    const updatedMealLog = await prisma.mealLog.update({
      where: { id: mealId },
      data: {
        picture: originalUpload.secure_url,
        thumbnail: thumbnailUpload.secure_url,
      },
    });

    console.log(`Updated meal log: ${JSON.stringify(updatedMealLog)}`);
  } catch (err) {
    console.error(`Failed to process job for meal ID: ${mealId}`, err);
  }
});

imageUpdateQueue.process(async(job) => {
  //extract the data from job
  const { filePath, newLogId, oldLogId, oldPictureUrl, oldThumbnailUrl } = job.data
  console.log("job data: ", job.data)
  try{
    console.log(`Processing update job for meal log ID ${newLogId}`)

    //delete old image from cloudinary
    if(oldPictureUrl) {
      await cloudinary.uploader.destroy(oldPictureUrl, { resource_type: "image"})
      console.log(`Deleted old picture: ${oldPictureUrl}`)
    }

    //delete old thumbnail from cloudinary
    if(oldThumbnailUrl) {
      await cloudinary.uploader.destroy(oldThumbnailUrl, { resource_type: "image"})
      console.log(`Deleted old picture: ${oldThumbnailUrl}`)
    }

    //read the original image into a buffer
    const imageBuffer = await sharp(filePath).toBuffer();
    //create a thumbnail from the original image buffer
    const thumbnailBuffer = await sharp(imageBuffer).resize(200).toBuffer()

    //upload both the original image and the thumbnail to Cloudinary
    const [originalUpload, thumbnailUpload] = await Promise.all([
        uploadToCloudinary(imageBuffer),
        uploadToCloudinary(thumbnailBuffer),
    ])

    console.log("here", originalUpload)

    //update meal log in the database with the Cloudinary urls
    const updatedMealLog = await prisma.mealLog.update({
      where: { id: newLogId },
      data: {
        picture: originalUpload.secure_url,
        thumbnail: thumbnailUpload.secure_url,
      },
    });
    console.log("updated in db", updatedMealLog)

    console.log(`Updated meal log: ${JSON.stringify(updatedMealLog)}`);
  }catch(err){
    console.error(`Failed to process job for meal ID: ${mealLogId}`, err);
  }
})

profilePictureQueue.process(async(job) => {
  //extract the data from job
  const { filePath, userId, oldPictureUrl, oldThumbnailUrl } = job.data
  console.log("job data: ", job.data)
  try{
    console.log(`Processing update job for user ID ${userId}`)

    //delete old image from cloudinary
    if(oldPictureUrl) {
      await cloudinary.uploader.destroy(oldPictureUrl, { resource_type: "image"})
      console.log(`Deleted old picture: ${oldPictureUrl}`)
    }

    //delete old thumbnail from cloudinary
    if(oldThumbnailUrl) {
      await cloudinary.uploader.destroy(oldThumbnailUrl, { resource_type: "image"})
      console.log(`Deleted old picture: ${oldThumbnailUrl}`)
    }

    //read the original image into a buffer
    const imageBuffer = await sharp(filePath).toBuffer();
    //create a thumbnail from the original image buffer
    const thumbnailBuffer = await sharp(imageBuffer).resize(200).toBuffer()

    //upload both the original image and the thumbnail to Cloudinary
    const [originalUpload, thumbnailUpload] = await Promise.all([
        uploadToCloudinary(imageBuffer),
        uploadToCloudinary(thumbnailBuffer),
    ])

    console.log("here", originalUpload)

    //update meal log in the database with the Cloudinary urls
    const updatedMealLog = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicUrl: originalUpload.secure_url,
        profileThumbnailUrl: thumbnailUpload.secure_url,
      },
    });
    console.log("updated in db", updatedMealLog)

    console.log(`Updated meal log: ${JSON.stringify(updatedMealLog)}`);
  }catch(err){
    console.error(`Failed to process job for meal ID: ${mealLogId}`, err);
  }
})