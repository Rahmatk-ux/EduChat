// cloudinaryUpload.js
export async function uploadFileToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dod7b9rpw/raw/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "assignment_raw_upload"); // unsigned preset

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.secure_url) return data.secure_url; // ALWAYS use secure_url
    else throw new Error("Upload failed");
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}
