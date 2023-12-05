export const alertType = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info"
}

export function createNotification(notification, type){
  if(
    (
      (!notification.message || notification?.message.length < 1) && 
      (!notification.status || notification?.status.length < 1)
    ) || !type){
    throw new Error("Message and Status are empty");
  }
  
  let notificationElement = document.createElement('div');
  notificationElement.className = 'notification alert alert-' + alertType[type];

  let closeButton = document.createElement('button');
  closeButton.className = 'close';
  closeButton.textContent = '×';

  let statusElement = document.createElement('strong');
  statusElement.className = 'status';
  statusElement.textContent = notification?.status;

  const messageElement = [];
  
  notification.message.split(';').forEach(element => {
    let temp = document.createElement('span');
    temp.className = 'message';
    temp.textContent = element.trim();
    messageElement.push(temp);
  });

  notificationElement.appendChild(closeButton);

  notificationElement.appendChild(statusElement);

  messageElement.forEach(item => {
    notificationElement.appendChild(item);
  })

  return notificationElement.outerHTML
} 

