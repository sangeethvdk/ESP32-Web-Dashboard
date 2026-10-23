
const broker = "wss://broker.hivemq.com:8884/mqtt";

// These topics must match your ESP32 code
const lightTopic = "eee_motor_demo_7f31/light";
const motorTopic = "eee_motor_demo_7f31/motor";

const badge = document.getElementById("connectionBadge");
const connectionText = document.getElementById("connectionText");

const controls = document.querySelectorAll(
  "button[data-device][data-command]"
);

const devices = {
  light1: {
    topic: lightTopic,
    card: document.getElementById("lightCard1"),
    state: document.getElementById("lightState1"),
    feedback: document.getElementById("lightFeedback1"),
    label: "Light 1"
  },

  light2: {
    topic: motorTopic,
    card: document.getElementById("lightCard2"),
    state: document.getElementById("lightState2"),
    feedback: document.getElementById("lightFeedback2"),
    label: "Light 2"
  }
};

let mqttConnected = false;

function setConnection(status, message) {
  badge.classList.remove("connected", "error");

  if (status === "connected") {
    badge.classList.add("connected");
  } else if (status === "error") {
    badge.classList.add("error");
  }

  connectionText.textContent = message;

  controls.forEach(button => {
    button.disabled = !mqttConnected;
  });
}

// Check that the MQTT library loaded
if (typeof mqtt === "undefined") {
  setConnection("error", "MQTT library failed to load");

  controls.forEach(button => {
    button.disabled = true;
  });

  throw new Error(
    "MQTT library missing. Check your internet connection."
  );
}

// Create the browser MQTT client
const client = mqtt.connect(broker, {
  clean: true,
  connectTimeout: 15000,
  reconnectPeriod: 3000,
  clientId:
    "web_smart_control_" +
    Math.random().toString(16).slice(2, 10)
});

client.on("connect", () => {
  console.log("Connected to HiveMQ over WebSockets");

  mqttConnected = true;
  setConnection("connected", "MQTT CONNECTED");

  Object.values(devices).forEach(device => {
    device.feedback.textContent =
      "Connected. Ready for commands.";
  });
});

client.on("reconnect", () => {
  console.log("Attempting MQTT reconnection");

  mqttConnected = false;
  setConnection("connecting", "Reconnecting...");
});

client.on("offline", () => {
  console.log("MQTT client offline");

  mqttConnected = false;
  setConnection("connecting", "MQTT offline");
});

client.on("close", () => {
  console.log("MQTT connection closed");

  mqttConnected = false;
  setConnection("connecting", "Connection closed");
});

client.on("error", error => {
  console.error("MQTT error:", error.message || error);

  mqttConnected = false;
  setConnection("error", "MQTT connection error");
});

function showCommand(device, command) {
  device.card.classList.toggle(
    "is-on",
    command === "ON"
  );

  device.state.textContent = `LAST COMMAND: ${command}`;

  device.feedback.textContent =
    `${device.label}: ${command} command sent. ` +
    "Physical state not confirmed.";

  device.card.querySelectorAll("button").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.command === command
    );
  });
}

// Handle ON and OFF buttons
controls.forEach(button => {
  button.addEventListener("click", () => {
    const device = devices[button.dataset.device];
    const command = button.dataset.command;

    if (!mqttConnected || !client.connected) {
      device.feedback.textContent =
        "MQTT is disconnected. Please wait for reconnection.";
      return;
    }

    button.disabled = true;

    client.publish(
      device.topic,
      command,
      { qos: 0, retain: false },
      error => {
        button.disabled = !mqttConnected;

        if (error) {
          console.error("Publish failed:", error);

          device.feedback.textContent =
            "Command failed to send. Please try again.";
          return;
        }

        showCommand(device, command);

        console.log(
          `${device.label} -> ${command} (${device.topic})`
        );
      }
    );
  });
});

setConnection("connecting", "Connecting to MQTT...");
console.log("Connecting to broker:", broker);
