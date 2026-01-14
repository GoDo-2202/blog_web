class SearchController {
  index(req, res) {
    res.render("search");
  }

  search(req, res) {
    console.log("PUT /search");
    console.log(req.body);
    res.redirect("search");
  }

  post(req, res) {
    console.log("Search");
    console.log(req.body);
    res.redirect("search");
  }

  put(req, res) {
    console.log("put update");
    console.log(req.body);
    res.redirect("search");
  }

  delete(req, res) {
    console.log("delete");
    console.log(req.body);
    res.redirect("search");
  }
}

export default new SearchController();
