class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // 할 일 추가
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 필터 버튼
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 삭제 버튼들
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text === '') {
            this.showNotification('할 일을 입력해주세요!', 'warning');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();

        input.value = '';
        this.showNotification('할 일이 추가되었습니다!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showNotification('할 일이 삭제되었습니다!', 'info');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 상태 변경
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('완료된 할 일이 없습니다!', 'warning');
            return;
        }

        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
        this.updateStats();
        this.showNotification(`${completedCount}개의 완료된 할 일이 삭제되었습니다!`, 'success');
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showNotification('삭제할 할 일이 없습니다!', 'warning');
            return;
        }

        if (confirm('정말로 모든 할 일을 삭제하시겠습니까?')) {
            const count = this.todos.length;
            this.todos = [];
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification(`${count}개의 할 일이 모두 삭제되었습니다!`, 'success');
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => this.getTodoItemHTML(todo)).join('');
        
        // 이벤트 리스너 다시 바인딩
        this.bindTodoEvents();
    }

    getTodoItemHTML(todo) {
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="checkbox ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo(${todo.id})">
                    ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: { icon: 'fas fa-clipboard-list', title: '할 일이 없습니다', subtitle: '새로운 할 일을 추가해보세요!' },
            active: { icon: 'fas fa-clock', title: '진행중인 할 일이 없습니다', subtitle: '모든 할 일이 완료되었습니다!' },
            completed: { icon: 'fas fa-check-circle', title: '완료된 할 일이 없습니다', subtitle: '할 일을 완료해보세요!' }
        };

        const message = messages[this.currentFilter];
        return `
            <div class="empty-state">
                <i class="${message.icon}"></i>
                <p>${message.title}</p>
                <small>${message.subtitle}</small>
            </div>
        `;
    }

    bindTodoEvents() {
        // 체크박스 클릭 이벤트
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('completedCount').textContent = completed;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // 간단한 알림 시스템
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 스타일 추가
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px'
        });

        // 타입별 색상
        const colors = {
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            info: '#2196F3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // 애니메이션
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 자동 제거
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 앱 초기화
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoList();
});

// 전역 함수로 노출 (HTML에서 직접 호출하기 위해)
window.todoApp = null;
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoList();
}); 