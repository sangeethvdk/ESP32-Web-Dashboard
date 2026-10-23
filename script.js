
const broker = "wss://broker.hivemq.com:8884/mqtt";

// Must match your ESP32 sketch
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

function setConnection(status, message) {
  badge.classList.remove("connected", "error");

  if (status === "connected") {
    badge.classList.add("connected");
  }

  if (status === "error") {
    badge.classList.add("error");
  }

  connectionText.textContent = message;

  controls.forEach(button => {
    button.disabled = status !== "connected";
  });
}

function showCommand(device, command) {
  device.card.classList.toggle("is-on", command === "ON");
  device.state.textContent = `LAST COMMAND: ${command}`;

  device.feedback.textContent =
    `${device.label}: ${command} command sent. ` +
    "Physical state is not confirmed.";

  device.card.querySelectorAll("button").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.command === command
    );
  });
}

const client = mqtt.connect(broker, {
  clean: true,
  connectTimeout: 10000,
  reconnectPeriod: 2000,
  clientId:
    "web_smart_control_" +
    Math.random().toString(16).slice(2, 10)
});

client.on("connect", () => {
  console.log("Connected to HiveMQ");
  setConnection("connected", "MQTT CONNECTED");
});

client.on("reconnect", () => {
  setConnection("connecting", "Reconnecting…");
});

client.on("offline", () => {
  setConnection("connecting", "MQTT OFFLINE");
});

client.on("close", () => {
  setConnection("connecting", "Connection closed");
});

client.on("error", error => {
  console.error("MQTT error:", error);
  setConnection("error", "MQTT CONNECTION ERROR");
});

controls.forEach(button => {
  button.addEventListener("click", () => {
    const device = devices[button.dataset.device];
    const command = button.dataset.command;

    if (!client.connected) {
      device.feedback.textContent =
        "Not connected. Wait for MQTT to reconnect.";
      return;
    }

    client.publish(
      device.topic,
      command,
      { qos: 0, retain: false },
      error => {
        if (error) {
          console.error("Publish failed:", error);
          device.feedback.textContent =
            "Could not send command. Please try again.";
          return;
        }

        showCommand(device, command);
        console.log(`${device.label} → ${command}`);
      }
    );
  });
});
