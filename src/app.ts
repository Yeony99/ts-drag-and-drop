// Drag & Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    drageLeaveHandler(event: DragEvent): void;
}



// 투두 타입
enum TodoStatus {
    Active,
    Finished
}
class Todo {
    constructor(
        public id: string,
        public title: string,
        public description: string, 
        public date: Date, 
        public status: TodoStatus
    ) {

    }
}

// 상태 관리 State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}
class TodoState extends State<Todo> {
    private todos: any[] = [];
    private static instance: TodoState;
    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new TodoState();
        return this.instance;
    }

    

    addTodo(title: string, description: string, date: Date) {
        const newTodo = new Todo(Math.random().toString(), title, description, date, TodoStatus.Active);

        this.todos.push(newTodo);
        for (const listenerFn of this.listeners) {
            listenerFn(this.todos.slice()); // 새로운 배열 전달
        }
    }
}

// 싱글톤 패턴으로 변경
// const todoState = new TodoState();
const todoState = TodoState.getInstance();


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


// 기본 컴포넌트 클래스 (General) 제네릭 추가
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    refElement: T;
    element: U;

    constructor(
        templateId: string, 
        refElementId: string, 
        insertAtStart: boolean,
        newElementId?: string,
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.refElement = document.getElementById(refElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if(newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBegging: boolean) {
        this.refElement.insertAdjacentElement(insertAtBegging? 'afterbegin' : 'beforeend', this.element);
    }

    // 상속받는 클래스에서 사용할 수 있게 명시
    abstract configure(): void;
    abstract renderContent(): void;
}


// TodoItem class

class TodoItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {

    private todo: Todo;

    constructor(refId: string, todo: Todo) {
        super('single-todo', refId, true, todo.id);
        this.todo = todo;

        this.configure();
        this.renderContent();
    }

    @autobind
    dragStartHandler(event: DragEvent): void {
        console.log(event)
    }

    dragEndHandler(_: DragEvent): void {
        console.log('DragEnd')
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.todo.title;
        this.element.querySelector('h3')!.textContent = new Date(this.todo.date).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
        this.element.querySelector('p')!.textContent = this.todo.description;
    }
}

class TodoList extends Component<HTMLDivElement, HTMLElement> {
    assignedTodos: Todo[];

    // 구체적인 문자열 타입으로 나타내기 위해 enum 사용 x 
    constructor(private type: 'active' | 'finished') {
        super('todo-list', 'app', false, `${type}-todos`);
        this.assignedTodos = [];

        // 베이스 클래스에서 호출하지 말고 상속 받는 곳에서 호출하기.
        this.configure();
        this.renderContent();
    }

    private renderTodos() {
        const listEl = document.getElementById(`${this.type}-todo-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const todoItem of this.assignedTodos) {
            new TodoItem(this.element.querySelector('ul')!.id, todoItem);
        }
    }


    renderContent() {
        const listId = `${this.type}-todo-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' TODO'
    }

    configure(): void {
        // 투두 타입 필터는 listener에서 처리
        todoState.addListener((todos: Todo[]) => {
            const relevantTodo = todos.filter(todo => {
                if(this.type === 'active') {
                    return todo.status === TodoStatus.Active;
                }
                return todo.status === TodoStatus.Finished;
            })
            this.assignedTodos = relevantTodo;
            this.renderTodos();
        });

    }
}


class TodoInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    DateInputElement: HTMLInputElement;

    constructor() {
        super('todo-input', 'app', true, 'user-input')

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.DateInputElement = this.element.querySelector('#date') as HTMLInputElement;

        this.configure();
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
            todoState.addTodo(title, desc, date);
            this.clearInputs();
        }
    }

    configure() {

        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent(): void {
        
    }
}

const tdInput = new TodoInput();
const activeTdList = new TodoList('active');
const finishedTdList = new TodoList('finished');