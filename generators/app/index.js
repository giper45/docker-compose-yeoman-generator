const Generator = require('yeoman-generator');
const utils = require('../utils')

const COMPOSENAME = 'compose.template';
const DOCKERNAME = 'Dockerfile.template';

module.exports = class extends Generator {
    async initializing() {


    }
    async prompting() {
        let questions = utils.inputPrompt('composeName', 'Name of docker-compose file?', 'docker-compose.yml')
        this.answers = await this.prompt(questions);
        this.composeName = this.answers.composeName;
        this.services = await utils.addService(this)
         while (await utils.questionPrompt(this, 'Do you want to add a new docker service?')) {
             this.services = await utils.addService(this, this.services)
         }
    }

    async writing() {
        this.fs.copyTpl(this.templatePath(COMPOSENAME), this.composeName, { services : this.services});
        // Built services has base image property, public image has image property
        let builtServices = this.services.filter(s => s.baseImage)
        builtServices.forEach(s => {
            this.fs.copyTpl(this.templatePath(DOCKERNAME), this.destinationPath(s.name), { baseImage: s.baseImage});
        })
    }

    async end() {

    }

}