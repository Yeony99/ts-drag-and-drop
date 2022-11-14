// autobind decorator 
function autobind(
    _target: any, 
    _methodName: string, 
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        // getter 설정
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}


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

    private getUserInput(): [string, string, Date] | void {
        const writtenTitle = this.titleInputElement.value;
        const writtenDescription = this.descriptionInputElement.value;
        const writtenDate = new Date(this.DateInputElement.value);

        if(writtenTitle.trim().length === 0 || writtenDescription.trim().length === 0 || isNaN((writtenDate.getTime()))) {
            alert('입력값에 오류가 있습니다. 다시 입력해주세요..')
            return;
        } else {
            return [writtenTitle, writtenDescription, writtenDate];
        }
    }

    private clearInputs(): void {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.DateInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();

        if(Array.isArray(userInput)) {
            const [title, desc, date] = userInput;

            console.log(title, desc, date)
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private attach() {
        this.refElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const tdInput = new TodoInput();