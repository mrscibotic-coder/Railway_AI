const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Allow large JPEG uploads
app.use(
  express.raw({
    type: "image/jpeg",
    limit: "2mb"
  })
);

// Enable CORS
app.use((req, res, next) => {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  next();
});

// =====================================================
// LATEST FRAME
// =====================================================

let latestFrame = null;

let latestFrameTime = 0;


// =====================================================
// RECEIVE FRAME FROM ESP32
// =====================================================

app.post(
  "/api/frame",
  (req, res) => {

    if (
      !req.body ||
      req.body.length === 0
    ) {

      return res.status(400).send(
        "No image received"
      );

    }

    latestFrame =
      Buffer.from(req.body);

    latestFrameTime =
      Date.now();

    console.log(
      "Camera frame received:",
      latestFrame.length,
      "bytes"
    );

    res.status(200).send(
      "Frame received"
    );

  }
);


// =====================================================
// RETURN LATEST FRAME
// =====================================================

app.get(
  "/api/frame",
  (req, res) => {

    if (!latestFrame) {

      return res.status(404).send(
        "No camera frame available"
      );

    }

    res.setHeader(
      "Content-Type",
      "image/jpeg"
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.send(
      latestFrame
    );

  }
);


// =====================================================
// CAMERA STATUS
// =====================================================

app.get(
  "/api/status",
  (req, res) => {

    const age =
      latestFrameTime
        ? Date.now() - latestFrameTime
        : null;

    res.json({

      camera:
        latestFrame !== null,

      lastFrameAge:
        age,

      serverTime:
        new Date().toISOString()

    });

  }
);


// =====================================================
// DASHBOARD
// =====================================================

app.use(
  express.static(
    path.join(__dirname)
  )
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Railway AI server running on port ${PORT}`
    );

  }
);