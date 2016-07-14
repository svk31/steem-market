import zlib from 'zlib'

module.exports = {
    renderFullPage: function renderFullPage(html, data) {
      return `
        <!doctype html>
        <html>
          <head>
            <title>Steemex</title>
            <meta name="description" content="Follow and trade on the Steem internal market for STEEM vs Steem Dollars" />
            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(data)};
            </script>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"  />
            <link rel="stylesheet" href="app.css"  />
          </head>
          <body>
            <div id="content">${html}</div>
            <script src="app.js" charset="utf-8"></script>
            <script src="highcharts.js" charset="utf-8"></script>
          </body>
        </html>
        `
    },

    write: function write(string, type, res) {
      zlib.gzip(string, (err, result) => {
        res.writeHead(200, {
          'Content-Length': result.length,
          'Content-Type': type,
          'Content-Encoding': 'gzip'
        })
        res.write(result)
        res.end()
      });
    }
}
