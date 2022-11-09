class TodoInput {
    templateElement: HTMLTemplateElement;
    refElement: HTMLDivElement;
    element: HTMLElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    DateInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('todo-input')! as HTMLTemplateElement;
        this.refElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.DateInputElement = this.element.querySelector('#date') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private submitHandler(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement.value);
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    private attach() {
        this.refElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const tdInput = new TodoInput();