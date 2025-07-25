const queue = [];
let processing = false;

function addJob(workflow) {
  queue.push(workflow);
}

function getQueue() {
  return queue;
}

async function processQueue() {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const job = queue.shift();
    await execute(job);
  }
  processing = false;
}

async function execute(job) {
  // Placeholder for real workflow execution logic
  await new Promise(res => setTimeout(res, 10));
  console.log('executed workflow', job.id);
}

module.exports = { addJob, getQueue, processQueue };
