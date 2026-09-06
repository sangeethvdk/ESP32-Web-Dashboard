// Connect to HiveMQ using WebSocket Secure
const broker = "wss://broker.hivemq.com:8884/mqtt";

// MQTT topics
const lightTopic = "eee_motor_demo_7f31/light";
const motorTopic = "eee_motor_demo_7f31/motor";

// Create MQTT client
const client = mqtt.connect(broker);

// When connected to HiveMQ
client.on("connect", function () {
    console.log("Connected to HiveMQ");

    document.querySelector(".status b").textContent = "Connected";
});

// If connection fails
client.on("error", function (error) {
    console.log("MQTT Error:", error);

    document.querySelector(".status b").textContent = "Connection Error";
});

// LED 1 ON
document.querySelectorAll(".device")[0]
    .querySelector(".on")
    .addEventListener("click", function () {

        client.publish(lightTopic, "ON");
        console.log("LED 1 → ON");
    });

// LED 1 OFF
document.querySelectorAll(".device")[0]
    .querySelector(".off")
    .addEventListener("click", function () {

        client.publish(lightTopic, "OFF");
        console.log("LED 1 → OFF");
    });

// LED 2 ON
document.querySelectorAll(".device")[1]
    .querySelector(".on")
    .addEventListener("click", function () {

        client.publish(motorTopic, "ON");
        console.log("LED 2 → ON");
    });

// LED 2 OFF
document.querySelectorAll(".device")[1]
    .querySelector(".off")
    .addEventListener("click", function () {

        client.publish(motorTopic, "OFF");
        console.log("LED 2 → OFF");
    });