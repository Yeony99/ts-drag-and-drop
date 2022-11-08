class TodoInput {
    templateElement: HTMLTemplateElement;
    refElement: HTMLDivElement;
    element: HTMLElement;

    constructor() {
        this.templateElement = document.getElementById('todo-input')! as HTMLTemplateElement;
        this.refElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.attach();
    }

    private attach() {
        this.refElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const tdInput = new TodoInput();