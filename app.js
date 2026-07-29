const tasks = [];
const taskForm = document.querySelector('#taskForm');
const taskList = document.querySelector('#taskList');
const taskDueInput = document.querySelector('#taskDue');
const summary = document.querySelector('#summary');
const emptyState = document.querySelector('#emptyState');
let taskId = 0;

// 今日の日付を YYYY-MM-DD 形式で返す
const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ステータスと CSS クラスの対応
const statusClassMap = {
    '未対応': 'is-todo',
    '処理中': 'is-doing',
    '完了': 'is-done',
};

// 期限のデフォルト値を今日の日付にする
const setDefaultDue = () => {
    taskDueInput.value = getToday();
};
setDefaultDue();

// 期限を表示用に YYYY/MM/DD へ整形する
const formatDue = (due) => due ? due.replaceAll('-', '/') : '';

// ステータスごとの件数を集計して見出しを更新する
const updateSummary = () => {
    const counts = { '未対応': 0, '処理中': 0, '完了': 0 };
    tasks.forEach((task) => counts[task.taskStatus]++);
    summary.textContent =
        `未対応 ${counts['未対応']}・処理中 ${counts['処理中']}・完了 ${counts['完了']}`;
    // タスクが0件のときは空状態を表示
    emptyState.hidden = tasks.length !== 0;
};
updateSummary();

// フォーム送信時の処理
taskForm.addEventListener('submit', (event) => {
    // ページ再読み込みを防止
    event.preventDefault();
    // フォームの値を取得
    taskId++;
    const taskName = taskForm.taskName.value;
    const taskDue = taskForm.taskDue.value;
    const taskStatus = taskForm.taskStatus.value;
    // タスクを追加
    tasks.push({ taskId, taskName, taskDue, taskStatus });
    // タスクを表示
    addTaskList(taskId, taskName, taskDue, taskStatus);
    // フォームをリセット
    taskForm.reset();
    // リセットで消えた期限を今日の日付に戻す
    setDefaultDue();
    // 件数の見出しを更新
    updateSummary();

});

// タスクを追加する関数
const addTaskList = (taskId, taskName, taskDue, taskStatus) => {
    // li要素を作成
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    // ステータスごとに色を変えるためのクラスを付与
    taskItem.classList.add(statusClassMap[taskStatus]);
    taskItem.setAttribute('data-task-id', taskId);
    // 今日より昔の期限なら期限切れクラスを付与
    const overdueClass = taskDue && taskDue < getToday() ? 'is-overdue' : '';
    taskItem.innerHTML = `
        <span class="task-name">${taskName}</span>
        <span class="task-due ${overdueClass}">${formatDue(taskDue)}</span>
        <select class="task-status" name="taskStatus" data-task-id="${taskId}">
            <option value="未対応" ${taskStatus === '未対応' ? 'selected' : ''}>未対応</option>
            <option value="処理中" ${taskStatus === '処理中' ? 'selected' : ''}>処理中</option>
            <option value="完了" ${taskStatus === '完了' ? 'selected' : ''}>完了</option>
        </select>
        <button type="button" class="delete-button" aria-label="削除">
            <img src="trash.svg" alt="" class="icon">
        </button>
    `;
    taskList.append(taskItem);
}

// タスク一覧をクリックした時の処理
taskList.addEventListener('click', (event) => {

    // 削除ボタンをクリックした時の処理
    const deleteButton = event.target.closest('.delete-button');
    if (deleteButton) {
        const deleteItem = event.target.closest('.task-item');
        // li要素を削除
        deleteItem.parentElement.removeChild(deleteItem);
        // タスクを変数配列から削除
        tasks.splice(tasks.findIndex((task) => task.taskId === Number(deleteItem.dataset.taskId)), 1);
        // 件数の見出しを更新
        updateSummary();
    }
});

// タスク一覧が変化する時の処理
taskList.addEventListener('change', (event) => {
    
    // ステータスを変更する時の処理
    const statusItem = event.target.closest('.task-status');
    if (statusItem) {
        const status = statusItem.value;
        tasks[tasks.findIndex(task => task.taskId === Number(statusItem.dataset.taskId))].taskStatus = status;
        // ステータスごとの色クラスを付け替える
        const taskItem = statusItem.closest('.task-item');
        taskItem.classList.remove('is-todo', 'is-doing', 'is-done');
        taskItem.classList.add(statusClassMap[status]);
        // 件数の見出しを更新
        updateSummary();
    }
});