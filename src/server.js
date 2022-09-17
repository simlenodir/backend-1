const { appendFile } = require("fs");
const http = require("http");
const { read, write } = require("./utils/FS");

const options = {
  "Content-Type": "application/json",
};

const server = http.createServer((req, res) => {
  let urlId = req.url.split("/")[2];

  // from here started method of GET
  if (req.method == "GET") {
    if (req.url == "/markets") {
      res.writeHead(200, options);
      let markets = read("markets.json");
      if (markets) {
        res.end(
          JSON.stringify({
            status: 200,
            data: markets,
          })
        );
      }

      if (!markets) {
        res.end(
          JSON.stringify({
            status: 400,
            message: "Not found you url",
          })
        );
      }
    }

    let params = req.url.split("/")[2];

    if (req.url == "/products") {
      let products = read("products.json");
      res.end(
        JSON.stringify(
          {
            status: 200,
            data: products,
          },
          null,
          4
        )
      );
      if (!products) {
        res.end(
          JSON.stringify({
            status: 400,
            message: "Products not found",
          })
        );
      }
    }

    if (req.url == `/products/${params}`) {
      let products = read("products.json");
      if (!products) {
        res.end(
          JSON.stringify({
            status: 400,
            message: "Products not found",
          })
        );
      }
      let branchs = read("branches.json");
      let branchProduct = branchs.filter((el) =>
        el.marketId == params && products.filter((c) => c.branchId == params)
          ? (el.product = products.filter((e) =>
              e.branchId == params ? e : ""
            ))
          : ""
      );
      // branchProduct.products = products.filter((el) =>
      //   el.branchId == params ? branchProduct.push(el) : ""
      // );
      // console.log(JSON.parse(branchProduct));
      res.end(
        JSON.stringify(
          {
            status: 200,
            data: branchProduct,
          },
          null,
          4
        )
      );
      // return;
    }

    if (req.url == "/workers") {
      let workers = read("workers.json");
      res.end(
        JSON.stringify(
          {
            status: 200,
            data: workers,
          },
          null,
          4
        )
      );
      return;
    }

    if (req.url == `/workers/${params}`) {
      let branchs = read("branches.json");
      let workers = read("workers.json");
      let foundWorker = branchs.filter((el) => el.marketId == params);
      let result = foundWorker.filter(
        (c) => (c.worker = workers.filter((z) => z.branchId == c.marketId))
      );

      res.end(
        JSON.stringify(
          {
            status: 200,
            data: result,
          },
          null,
          4
        )
      );
      return;
    }

    if (req.url == `/markets/${params}`) {
      let founMarket = [];
      let markets = read("markets.json").find((e) => e.id == params);

      if (!markets) {
        res.writeHead(200, options);

        res.end(
          JSON.stringify({
            status: 400,
            message: "Market is not found",
          })
        );
        return;
      }

      let branches = read("branches.json");

      founMarket.push(markets);
      let branchesM = founMarket.filter((e) =>
        e.id == params && branches.find((v) => e.id == v.marketId)
          ? (e.branches = branches.filter((el) => el.marketId == params))
          : "branches not found"
      );

      //   console.log(JSON.parse(branchesM));
      const workers = read("workers.json");

      branchesM.forEach((e) =>
        e.branches?.map((c) =>
          c.marketId == params && workers.find((z) => z.branchId == c.marketId)
            ? (c.workers = workers.filter((el) => el.branchId == params))
            : "worker is not found"
        )
      );
      let products = read("products.json");

      branchesM.forEach((e) =>
        e?.branches?.map((c) =>
          c.marketId == params && products.find((z) => z.branchId == c.marketId)
            ? (c.products = products.filter((el) => el.branchId == c.marketId))
            : "products is not found"
        )
      );

      res.writeHead(200, options);
      res.end(
        JSON.stringify({
          status: 200,
          data: founMarket,
        })
      );
      return;
    }
    // mashetdan to'xtimiz
    if (req.url == "/workers") {
      let workerInfo = [];
      let foundworker = read("workers.json").map((e) => (e ? e : null));
      workerInfo.push(foundworker);
      res.writeHead(200, options);

      res.end(JSON.stringify(workerInfo));
    }

    if (req.url == `/workers/${params}`) {
      console.log(params);
      let workers = read("workers.json");
      let foundWorker = workers.find((e) => (e.id == params ? e : ""));
      if (foundWorker) {
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            status: 200,
            data: foundWorker,
          })
        );
      }
      if (foundWorker) {
        res.writeHead(200, options);
        res.end(
          JSON.stringify({
            status: 200,
            data: foundWorker,
          })
        );
      }
      if (!foundWorker) {
        res.writeHead(400, options);
        res.end(
          JSON.stringify({
            status: 400,
            message: "Not found like this worker",
          })
        );
      }
      return;
    }
    return;
  }

  // from here started method of POST
  if (req.method == "POST") {
    if (req.url == "/newMarket") {
      req.on("data", (chunk) => {
        const { name } = JSON.parse(chunk);
        const markets = read("markets.json");
        console.log(markets);
        markets.push({ id: markets.at(-1)?.id + 1 || 1, name });
        write("markets.json", markets, (err) => {
          if (err) throw err;
          res.writeHead(201, options);
        });
        res.end("new market created");
      });
      return;
    }
    // res.end("new market created");
    if (req.url == "/newBranch") {
      req.on("data", (chunk) => {
        const { name, marketId } = JSON.parse(chunk);

        const branches = read("branches.json");
        branches.push({
          id: branches.at(-1)?.id + 1 || 1,
          marketId,
          name,
        });
        console.log(branches);
        write("branches.json", branches);
        res.writeHead(201, options);
        return res.end("OK");
      });
      res.end("created new branch");
      return;

      res.end("ok");
    }

    if (req.url == "/newProduct") {
      req.on("data", (chunk) => {
        const { productName, branchId, price } = JSON.parse(chunk);
        const products = read("products.json");

        products.push({
          id: products.at(-1).id + 1 || 1,
          productName,
          branchId,
          price,
        });

        write("products.json", products, (err) => {
          if (err) throw err;
          res.writeHead(201, options);
          res.end("OK");
        });
        // console.log(products);
      });
      res.end("OK");
    }

    if (req.url == "/newWorker") {
      req.on("data", (chunk) => {
        const workers = read("workers.json");
        const { name, branchId, age, salary, expierence } = JSON.parse(chunk);

        workers.push({
          id: workers.at(-1).id + 1 || 1,
          name,
          branchId,
          age,
          expierence,
          salary,
        });

        write("workers.json", workers, (err) => {
          if (err) throw err;
          res.writeHead(201, options);
          res.end("OK");
        });
        console.log(workers);
      });
    }
    res.end("OK");
    return;
  }

  // from here started method of PUT
  if (req.method == "PUT") {
    let urlId = req.url.split("/")[2];
    let urlName = req.url.split("/")[1];

    if (urlName == "markets" && urlId) {
      req.on("data", (chunk) => {
        const { name } = JSON.parse(chunk);
        const markets = read("markets.json");
        const market = markets.find((v) => v.id == urlId);
        console.log(market.name);
        market.name = name || market.name;
        write("markets.json", markets);
        res.writeHead(205, options);
      });
      res.end("market is updated succesfully");
      return;
    }

    if (urlName == "branches" && urlId) {
      req.on("data", (chunk) => {
        const { name, branchId } = JSON.parse(chunk);
        const branches = read("branches.json");
        const branch = branches.find((v) => v.id == urlId);
        branch.name = name || branch.name;
        branch.branchId = branchId || branchId;
        write("branches.json", branches);
        res.writeHead(205, options);
      });
      res.end("branch is updated succesfully");
      return;
    }

    if (urlName == "product" && urlId) {
      req.on("data", (chunk) => {
        const { productName, branchId, price } = JSON.parse(chunk);
        const products = read("products.json");
        const product = products.find((v) => v.branchId == urlId);
        product.productName = productName || product.productName;
        product.branchId = branchId || product.branchId;
        product.price = price || product.price;
        write("products.json", products);
        res.writeHead(205, options);
      });
      res.end("product is updated succesfully");
      return;
    }

    if (urlName == "worker" && urlId) {
      req.on("data", (chunk) => {
        const { name, branchId, experience, salary } = JSON.parse(chunk);
        const workers = read("workers.json");
        const worker = workers.find((v) => v.branchId == urlId);
        console.log(worker.name);
        worker.name = name || worker.name;
        worker.branchId = branchId || worker.branchId;
        worker.salary = salary || worker.salary;
        worker.experience = experience || worker.experience;
        write("workers.json", workers);
        res.writeHead(205, options);
      });
      res.end("worker is updated succesfully");
      return;
    }
  }

  // from there is started DELETE method
  if (req.method == "DELETE") {
    if (req.url == `/deletMarket/${urlId}`) {
      let markets = read("markets.json");
      let branches = read("branches.json");
      let products = read("products.json");
      let workers = read("workers.json");
      //
      filtredMarkets = markets.filter((el) => (el.id != urlId ? el : ""));
      filterBranches = branches.filter((el) => (el.id != urlId ? el : ""));
      filterProducts = products.filter((el) =>
        el.branchId != urlId ? el : ""
      );
      filtredWorkers = workers.filter((el) => el.branchId != urlId);
      //
      write("markets.json", filtredMarkets);
      write("branches.json", filterBranches);
      write("products.json", filterProducts);
      write("workers.json", filtredWorkers);
      res.writeHead(200, options);
      return res.end("has been deleted");
    }
    if (req.url == `/deletBranch/${urlId}`) {
      let branches = read("branches.json");
      filterBranches = branches.filter((el) => el.id != urlId);
      write("branches.json", filterBranches);
      res.writeHead(200, options);
      return res.end("has been branch deleted");
    }
    if (req.url == `/deleteProduct/${urlId}`) {
      let products = read("products.json");
      filterProducts = products.filter((el) =>
        el.branchId != urlId ? el : ""
      );
      write("products.json", filterProducts);
      res.writeHead(200, options);
      return res.end("has been deleted");
    }
    if (req.url == `/deletWorker/${urlId}`) {
      let workers = read("workers.json");
      filtredWorkers = workers.filter((el) => el.branchId != urlId);
      write("workers.json", filtredWorkers);
      res.writeHead(200, options);
      return res.end("has been deleted");
    }
    return;
  }

  // if (condition) {
  // }
  res.end("OK");
});

server.listen(4004, console.log(4004));
