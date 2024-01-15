import express from 'express'
import { example0 } from './ex0'
import { example1 } from './ex1'
import { example2 } from './ex2'
import { example3, example4, example5, example6 } from './ex3'

const app = express()

type Example = () => string
const examples: Record<string, Example> = {
  '0': example0,
  '1': example1,
  '2': example2,
  '3': example3,
  '4': example4,
  '5': example5,
  '6': example6,
}

const helpPage = `
<h1>Scat Examples</h1>
<ul>
    ${Object.keys(examples)
      .map((id) => `<li><a href="/${id}">${id}</a></li>`)
      .join('\n')}
</ul>
`

app.get('/:id', (req, res) => {
  const { id } = req.params
  const example = examples[id]

  let page: string
  if (!example) {
    page = helpPage
  } else {
    const svgString = example()
    page = `
<div style="display: flex;">
${svgString}
<div style="margin-left: 20px;">
${helpPage}
</div>
`
  }

  const html = `
<!DOCTYPE html>
<html>
<body>
${page}
</body>
</html>
  `

  // Set proper headers for the response
  res.set('Content-Type', 'text/html')
  res.status(200).send(html)
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
