import News from "../models/News.js";

class NewsController {
  async index(req, res) {
    const newsList = await News.find().lean();
    res.render("news", { newsList });
  }

  async search(req, res) {
    console.log("PUT /news")
    console.log(req.body)
    res.redirect("/news")
  }

  async post(req, res) {
    console.log("add news");
    console.log(req.body)
    await News.create(req.body)
    res.redirect("news")
  }

  async put(req, res) {
    console.log("put update news");
    console.log(req.body)
    await News.updateOne({ _id: req.params.id }, req.body)
    res.redirect("/news")
  }

  async delete(req, res) {
    console.log("delete news");
    console.log(req.body);
    await News.deleteOne({ _id: req.params.id })
    res.redirect("/news")
  }
}

export default new NewsController();
