/**
   * Iterate through elements of a container. Execute a given function for each element in parallel.
   * @category Process
   * @param {String} command - A string containg the call and path. "call/a/b": this calls Qrtz function using $1 = "a", $2 = "b".
   * @example
   * data ["a","b","c"]
   * each test                  //  calls test with data = {key=0, value="a"}, and further
   * data {"a":0,"b":1}
   * each test/x/y              //  calls test starting with data = {data: {"a":0,"b":1}, key:"a", value:0} and $1 = "x", $2 = "y", and further
   * data {"a":0,"b":1}
   * each test/x/y z            //  calls test starting with data = {data: {"a":0,"b":1}, key:"a", value:0, meta: "z"} and $1 = "x", $2 = "y", and further
   */
exports.each = data => function (p, command, meta) {
  let processIDs;
  if (data instanceof Array) { // Array
    if (data.length === 0) {
      p.next([]);
      return;
    }
    processIDs = [];
    for (let key = 0; key < data.length; ++key) {
      processIDs.push(this.fork(p, command, {data, key: key, value: data[key], meta}, key));
    }
  } else if (typeof data === 'object' && data !== null) { // Dictionary
    if (Object.keys(data).length === 0) {
      p.next({});
      return;
    }
    processIDs = {};
    for (let key in data) {
      processIDs[key] = this.fork(p, command, {data, key: key, value: data[key], meta}, key);
    }
  } else { // TODO string
    p.fail('each expects array or object.');
  }
};
