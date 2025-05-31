export function sendResponse(socket, response, last = true) {
  const responseData = {
    type: "text",
    token: response,
    last,
  };
  socket.send(JSON.stringify(responseData));
}

export function sendErrorAndEnd(socket, errorMessage) {
  const errorData = {
    type: "text",
    token: errorMessage,
    last: true,
  };
  socket.send(JSON.stringify(errorData));
  socket.send(JSON.stringify({ type: "end" }));
}
