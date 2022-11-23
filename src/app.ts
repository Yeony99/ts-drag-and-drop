// Validation
interface Validatable {
    value: string | Date;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minDate?: string;
    maxDate?: string;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        if (validatableInput.value instanceof Date) {
            isValid = isValid && isNaN(new Date(validatableInput.value).getTime()) !== true
        }
    }

    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }

    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }

    if (validatableInput.minDate != null && !isNaN(new Date(validatableInput.minDate).getTime())) {
        isValid = isValid && new Date(validatableInput.value) > new Date(validatableInput.minDate);
    }

    if (validatableInput.maxDate != null && !isNaN(new Date(validatableInput.maxDate).getTime())) {
        isValid = isValid && new Date(validatableInput.value) > new Date(validatableInput.maxDate);
    }

    return isValid;
}

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


class TodoList {
    templateElement: HTMLTemplateElement;
    refElement: HTMLDivElement;
    element: HTMLElement;

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('todo-list')! as HTMLTemplateElement;
        this.refElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-todos`
        this.attach();
        this.renderContent();
    }

    private renderContent() {
        const listId = `${this.type}-todo-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' TODO'
    }

    private attach() {
        this.refElement.insertAdjacentElement('beforeend', this.element);
    }
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
        this.element.id = 'user-input'

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

        const titleValidatable: Validatable = {
            value: writtenTitle,
            required: true,
            minLength: 2,
            maxLength: 20
        };

        const descValidatable: Validatable = {
            value: writtenDescription,
            required: true,
            maxLength: 20
        };

        const dateValidatable: Validatable = {
            value: writtenDate,
            required: true,
            minDate: new Date().toDateString()
        };

        if (!validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(dateValidatable)) {
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

        if (Array.isArray(userInput)) {
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
const activeTdList = new TodoList('active');
const finishedTdList = new TodoList('finished');