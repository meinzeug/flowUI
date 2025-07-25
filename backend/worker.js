export const queue = [];
let interval;

export function enqueueTask(task) {
  queue.push(task);
}

export function startWorker(broadcast) {
  if (interval) return;
  interval = setInterval(() => {
    if (queue.length === 0) return;
    const task = queue.shift();
    const result = { taskId: task.id, ...task.payload, status: 'done' };
    broadcast(task.channel, result);
  }, 1000);
}
