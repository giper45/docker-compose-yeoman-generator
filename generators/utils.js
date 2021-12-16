const prompt = (type, name, message, defaultValue, answers = []) => {
    return [{
        type,
        name,
        message,
        default : defaultValue
    }].concat(answers);
}
const inputPrompt = (name, message, defaultValue = '', answers = []) => prompt('input', name, message, defaultValue, answers);
const listPrompt = (name, message, choices, defaultValue = choices[0], answers = []) => {
    return  [{
        type: 'list',
        name,
        message,
        choices,
        default: defaultValue
}].concat(answers)
};

const questionPrompt = async (generator, message = 'Do you want to continue', defaultResponse = 'no') => {
    let questions = listPrompt('continue', message, ['yes', 'no'], defaultResponse);
    let response = await generator.prompt(questions);
    return response.continue == 'yes' ? true : false;
}

const addBuiltInfo = async(generator, theService) => {
    let resp = await generator.prompt(inputPrompt('imageName', 'Base Image name?', 'ubuntu:latest'));
    theService.baseImage = resp.imageName;
}

const addImageInfo = async(generator, theService) => {
    let resp = await generator.prompt(inputPrompt('imageName', 'Image name?', 'ubuntu:latest'));
    theService.image = resp.imageName;
}

const addPort = async(generator, theService) => {
    let questions = inputPrompt('hostPort', 'Host Port?')
    questions = inputPrompt('containerPort', 'Container Port?', '', questions)
    let resp = await generator.prompt(questions);
    if (!theService.ports)
        theService.ports = []

    theService.ports.push({
        host: resp.hostPort,
        container: resp.containerPort
    })
}

const addService = async(generator, services = []) => {
    let theService = {}
    let resp = await generator.prompt(inputPrompt('serviceName', 'Service Name?'));
    theService.name = resp.serviceName;
    // Public -> image: , not public: build:
    let isPublic = await questionPrompt(generator, 'Has a public image', 'yes');
    if (isPublic)
        await addImageInfo(generator, theService);
    else
        await addBuiltInfo(generator, theService);

    while (await questionPrompt(generator, 'Do you want to expose a new port?')) {
        await addPort(generator, theService);
    }
    


    return [theService].concat(services).reverse();

}

exports.prompt = prompt;
exports.inputPrompt = inputPrompt;
exports.listPrompt = listPrompt;
exports.questionPrompt = questionPrompt;
exports.addService = addService;