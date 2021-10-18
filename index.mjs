#!/usr/bin/env node

import { parseStringPromise } from 'xml2js'
import { existsSync, readFileSync, appendFileSync, readdirSync } from 'fs'
import { program } from 'commander'
import inquirer from 'inquirer'

program
  .description('converts idea run configurations in project to dotenv')
  .action(async () => {
    try {
      if (!existsSync(`.idea`)) throw new Error('.idea folder does not exist. exiting')
      if (!existsSync(`.idea/runConfigurations`)) throw new Error('.idea/runConfigurations folder does not exist. exiting')

      // Get file choices
      let choices = []
      readdirSync('.idea/runConfigurations/').forEach(file => choices.push(file))

      let answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'What run configuration?',
          choices: choices,
        },
      ])

      const xmlPath = `.idea/runConfigurations/${answers.choice}`

      let xmlString = readFileSync(xmlPath, "utf8")

      let xml = await parseStringPromise(xmlString, { mergeAttrs: true })
      let json = JSON.parse(JSON.stringify(xml, null, 4))
      let env = json.component.configuration[0].envs[0].env
      
      env.forEach(async (e) => {
        appendFileSync('.env', `${e.name}=${e.value}\n`)
        console.log(`${e.name}=${e.value}`)
      })
    } catch (error) {
      console.error(error);
      process.exit(1)
    }
  })

program.parse();