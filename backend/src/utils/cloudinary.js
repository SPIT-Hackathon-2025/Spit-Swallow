import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'


cloudinary.config({ 
  cloud_name: 'dyv9yatlf', 
  api_key: '696925891624293', 
  api_secret: 'sORDi3RTnXxiOjMGmz_PwwjMOew'
});


const uploadOnCloudinary = async (localFilePath) => {
  // console.log('Cloudinary Config:', {
  //   cloud_name: 'dyv9yatlf',
  //   api_key: '696925891624293',
  //   api_secret: 'sORDi3RTnXxiOjMGmz_PwwjMOew'
  // });
  
  try { 
      console.log('Local path:', localFilePath);
      if (!localFilePath) return null;

      // Check if the file exists
      if (!fs.existsSync(localFilePath)) {
          console.error('File not found:', localFilePath);
          return null;
      }

      // Upload to Cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'auto'
      });

      // Remove local file after successful upload
      fs.unlinkSync(localFilePath);
      return response;

  } catch (error) {
      console.error('Error uploading to Cloudinary:', error);

      // Ensure to clean up local file in case of error
      if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
      }

      return null;
  }
};

const deleteFromCloudinary = async (public_id) => {
      try {
        const response =await cloudinary.uploader.destroy(public_id) ;
        return response ;
      } catch (error) {
        console.log('Error in deleting image from cloudinary');
      }
}

export {uploadOnCloudinary , deleteFromCloudinary ,cloudinary}