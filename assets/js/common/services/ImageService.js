class ImageService extends HttpClientBase {
  photo() { return this.get("/users/photo"); }
  uploadPhoto(file) {
    const data = new FormData();
    data.append("photo", file);
    return this.postForm("/users/photo", data);
  }
  gallery(foodId) { return this.get(this.#galleryRoute(foodId)); }
  addImage(foodId, file, altText) {
    const data = new FormData();
    data.append("image", file);
    data.append("alt_text", altText);
    return this.postForm(this.#galleryRoute(foodId), data);
  }
  removeImage(foodId, imageId) {
    return this.delete(this.#galleryRoute(foodId) + "/" + EntityValidation.id(imageId));
  }
  url(path) {
    if (typeof path !== "string" || !/^uploads\/[a-f0-9]{32}\.(jpg|png|webp)$/.test(path)) return null;
    return this.baseURL + "/" + path;
  }
  #galleryRoute(foodId) { return "/alimentos/" + EntityValidation.id(foodId) + "/imagens"; }
}
