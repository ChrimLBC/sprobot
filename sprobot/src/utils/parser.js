export const parseStatus = (statusCode) => {
    var code;
    switch (statusCode) {
      case 0:
        code = "Connected";
        break;
      case 1:
        code = "Connecting";
        break;
      case 2:
        code = "Reconnecting";
        break;
      case 3: 
        code = "Idle";
        break;
      case 4:
        code = "Nearly";
        break;
      case 5:
      default:
        code = "Disconnected";
    }
    return code;
  }