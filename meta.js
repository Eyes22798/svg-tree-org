const fse = require('fs-extra')
const prompts = [
  {
    type: 'input',
    name: 'name',
    message: 'componentName',
    validate(input){
      if(!input){
        return 'component name is required.'
      }
      if(fse.existsSync(input)){
        return 'component name of folder is exist.'
      }
      if (input.indexOf('@eyes22798/') !== 0) {
        return 'please prefix the component name with <@eyes22798/>'
      }
      return true
    }
  },
  {
    type: 'input',
    name: 'version',
    message: 'version',
    default: '0.0.1'
  },
  {
    type: 'input',
    name: 'description',
    message: 'description'
  },
  {
    type: 'input',
    name: 'author',
    message: 'author name'
  },
  {
    type: 'list',
    name: 'license',
    message: 'license(default:MIT)',
    choices: [
      'MIT',
      'BSD',
      'edit later'
    ],
    default: 'MIT'
  },
  {
    type: 'input',
    name: 'homepage',
    message: 'component homepage'
  },
  {
    type: 'input',
    name: 'repository',
    message: 'component repository',
  },
]

module.exports = prompts
