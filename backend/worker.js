const Queue = require("bull");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const { PrismaClient } = require("@prisma/client");
const { redisConfig, cloudinaryConfig } = require("./config");

//All the code in this file was written without assistance 

//initialize a new queue to process images with redis configuration
const imageQueue = new Queue("image-processing", { redis: redisConfig });
//initialize a new queue to update images
const imageUpdateQueue = new Queue("image-update", { redis: redisConfig })
//initialize a new queue to process profile pictures
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
        imgStatus: "COMPLETED",
      },
    });

    return {
      mealLogId: updatedMealLog.id,
      picture: updatedMealLog.picture,
      thumbnail: updatedMealLog.thumbnail,
    }
  } catch (err) {
    //update imgStatus to FAILED
    await prisma.mealLog.update({
      where: {id: mealId},
      data: {imgStatus: 'FAILED'}
    })
    throw err
  }
});

imageUpdateQueue.process(async(job) => {
  //extract the data from job
  const { filePath, newLogId, oldLogId, oldPictureUrl, oldThumbnailUrl } = job.data

  try{
    //delete old image from cloudinary
    if(oldPictureUrl) {
      await cloudinary.uploader.destroy(oldPictureUrl, { resource_type: "image"})
    }

    //delete old thumbnail from cloudinary
    if(oldThumbnailUrl) {
      await cloudinary.uploader.destroy(oldThumbnailUrl, { resource_type: "image"})
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

    //update meal log in the database with the Cloudinary urls
    const updatedMealLog = await prisma.mealLog.update({
      where: { id: newLogId },
      data: {
        picture: originalUpload.secure_url,
        thumbnail: thumbnailUpload.secure_url,
        imgStatus: "COMPLETED",
      },
    });

    console.log(`Updated meal log: ${JSON.stringify(updatedMealLog)}`);
  }catch(err){
    //update imgStatus to FAILED
    await prisma.mealLog.update({
      where: {id: newLogId},
      data: {imgStatus: 'FAILED'}
    })
    throw err
  }
})

profilePictureQueue.process(async(job) => {
  //extract the data from job
  const { filePath, userUid, oldPictureUrl, oldThumbnailUrl } = job.data
  try{
    console.log(`Processing update job for user ID ${userUid}`)

    //delete old image from cloudinary
    if(oldPictureUrl) {
      await cloudinary.uploader.destroy(oldPictureUrl, { resource_type: "image"})
    }

    //delete old thumbnail from cloudinary
    if(oldThumbnailUrl) {
      await cloudinary.uploader.destroy(oldThumbnailUrl, { resource_type: "image"})
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

    //profile picture in the database with the Cloudinary urls
    const updatedUser = await prisma.user.update({
      where: { uid: userUid },
      data: {
        profilePicUrl: originalUpload.secure_url,
        profileThumbnailUrl: thumbnailUpload.secure_url,
        imgStatus: "COMPLETED",
      },
    });

    console.log(`Updated user: ${JSON.stringify(updatedUser)}`);
  }catch(err){
    //update imgStatus to FAILED
    await prisma.user.update({
      where: {uid: userUid},
      data: {imgStatus: 'FAILED'}
    })
    throw err
  }
})