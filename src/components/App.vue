<template>
  <div id="app">
    <div class="mobile-tip">Mobile version is coming soon..</div>
    <header class="header">SVG to Vue Component</header>
    <main class="main">
      <monaco-editor
        class="editor input-editor"
        v-model="input"
        :options="inputOptions"
        language="html"
      />
      <monaco-editor
        class="editor output-editor"
        v-model="output"
        :options="outputOptions"
        language="html"
      />
      <div class="preview" v-html="input"></div>
    </main>
    <footer class="footer">
      <button class="button" @click="$refs.svgInput.click()">Select SVG File</button>
      <button class="button" @click="promptSVGURL">Input SVG URL</button>
      <input ref="svgInput" type="file" style="display:none" accept=".svg" name="svg" @change="handleSelectFile">
      <button class="button" @click="convert" :disabled="converting || !input">
        {{ converting ? 'Converting..' : 'Convert to SFC' }}
      </button>&nbsp;&nbsp;
      <a href="https://github.com/egoist/svg2vue">Source Code</a>
    </footer>
  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco'
import axios from 'axios'

const defaultInput = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <g data-name="Layer 2">
    <g data-name="heart">
      <rect width="24" height="24" opacity="0" />
      <path
        d="M12 21a1 1 0 0 1-.71-.29l-7.77-7.78a5.26 5.26 0 0 1 0-7.4 5.24 5.24 0 0 1 7.4 0L12 6.61l1.08-1.08a5.24 5.24 0 0 1 7.4 0 5.26 5.26 0 0 1 0 7.4l-7.77 7.78A1 1 0 0 1 12 21zM7.22 6a3.2 3.2 0 0 0-2.28.94 3.24 3.24 0 0 0 0 4.57L12 18.58l7.06-7.07a3.24 3.24 0 0 0 0-4.57 3.32 3.32 0 0 0-4.56 0l-1.79 1.8a1 1 0 0 1-1.42 0L9.5 6.94A3.2 3.2 0 0 0 7.22 6z"
      />
    </g>
  </g>
</svg>
`

export default {
  components: {
    MonacoEditor
  },

  data() {
    return {
      input: defaultInput,
      output: '',
      converting: false,
      inputOptions: {
        minimap: {
          enabled: false
        },
        wordWrap: 'on'
      },
      outputOptions: {
        minimap: {
          enabled: false
        },
        wordWrap: 'on'
      }
    }
  },

  watch: {
    '$route.query.url': {
      handler() {
        this.initFromURL()
      },
      immediate: true
    }
  },

  methods: {
    async initFromURL() {
      const { url } = this.$route.query

      if (url) {
        this.input = 'Loading SVG...'
        try {
          const res = await axios.get(url)
          this.input = res.data
          await this.convert()
        } catch (error) {
          this.input = ''
          this.output = error.stack
        }
      }
    },

    async convert() {
      this.converting = true
      try {
        const {
          data: { code }
        } = await axios.post('https://svg2vue.egoist.sh/api/transform', {
          code: this.input
        })
        this.output = code
      } catch (error) {
        this.output = error.stack
      }
      this.converting = false
    },

    handleSelectFile(e) {
      const reader = new FileReader()
      reader.onload = e => {
        const svg = atob(e.target.result.replace('data:image/svg+xml;base64,', ''))
        this.input = svg
        this.convert()
      }
      reader.readAsDataURL(e.target.files[0])
    },

    promptSVGURL(e) {
      const url = prompt('Input SVG URL (http://example.com/foo.svg)')
      console.log(url)
      this.$router.push({
        query: {
          ...this.$route.query,
          url
        }
      })
    }
  }
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

a {
  color: #333;
}

:root {
  --header-height: 60px;
  --footer-height: 40px;
  --main-height: calc(100vh - var(--header-height) - var(--footer-height));
  --border-color: #e2e2e2;
  --preview-height: 300px;
}
</style>

<style scoped>
.mobile-tip {
  text-align: center;
  font-size: 4rem;
  background: #9e9e9e;
  color: white;
  padding: 100px 40px;
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
}

.header {
  height: var(--header-height);
  line-height: var(--header-height);
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  font-size: 1.4rem;
}

.footer {
  height: var(--footer-height);
  line-height: var(--footer-height);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.main {
  display: flex;
  position: relative;
}

.editor {
  height: var(--main-height);
  width: 50vw;
  border-right: 1px solid var(--border-color);
}

.input-editor {
  height: calc(var(--main-height) - var(--preview-height));
}

.preview {
  position: absolute;
  width: 50%;
  bottom: 0;
  border-top: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  padding: 20px;
  height: var(--preview-height);
  overflow: auto;
}

.preview >>> svg {
  max-width: 200px;
  max-height: 200px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
