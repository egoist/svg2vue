const toVue = require('svg-to-vue-component')
const SVGO = require('svgo')
const prettier = require('prettier')

const svgo = new SVGO({
  plugins: [{ prefixIds: true }, { removeViewBox: false }]
})

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'POST') {
    let body = ''
    req.on('data', data => {
      body += data.toString()
    })
    req.on('end', async () => {
      try {
        const parsedBody = body ? JSON.parse(body) : {}
        const inputCode = parsedBody.code
          ? await svgo
              .optimize(parsedBody.code, {
                path: this.resourcePath
              })
              .then(res => res.data)
          : ''
        const outputCode = await toVue(inputCode).then(({ component }) => {
          return prettier.format(component, { parser: 'vue' })
        })
        res.end(
          JSON.stringify({
            code: outputCode
          })
        )
      } catch (error) {
        res.statusCode = 500
        res.end(error.stack)
      }
    })
  } else {
    res.end(`POST / with body \`{ code: 'input svg code' }\`.
    
Response: \`{ code: 'output vue component' }\`

Source code: https://github.com/egoist/svg2vue

Web app: https://svg2vue.egoist.sh`)
  }
}
