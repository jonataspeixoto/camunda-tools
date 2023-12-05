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
    return null;
  }
  
  let notificationElement = document.createElement('div');
  notificationElement.className = 'notification alert alert-' + alertType[type];

  let closeButton = document.createElement('button');
  closeButton.className = 'close';
  closeButton.textContent = '×';

  let statusElement = document.createElement('strong');
  statusElement.className = 'status';
  statusElement.textContent = notification?.status;

  var messageElement = document.createElement('span');
  messageElement.className = 'message';
  messageElement.textContent = notification?.message;

  notificationElement.appendChild(closeButton);

  notificationElement.appendChild(statusElement);

  notificationElement.appendChild(messageElement);

  return notificationElement.outerHTML
} 

