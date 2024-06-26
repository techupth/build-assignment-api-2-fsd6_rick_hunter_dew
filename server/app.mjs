import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/assignments", async (req, res) => {
  try {
    const results = await connectionPool.query("SELECT * FROM assignments");
    return res.status(200).json({ data: results.rows });
  } catch {
    return res
      .status(500)
      .json({
        message:
          "Server could not read assignments because of a database error",
      });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const results = await connectionPool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [assignmentId]
    );
    if (!results.rows[0]) {
      return res
        .status(404)
        .json({ message: "Server could not find the requested assignment" });
    }
    return res.status(200).json({ data: results.rows[0] });
  } catch {
    return res
      .status(500)
      .json({
        message: "Server could not read assignment because of a database error",
      });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  const { title, content, category } = req.body;
  try {
    const results = await connectionPool.query(
      "UPDATE assignments SET title = $1, content = $2, category = $3 WHERE id = $4 RETURNING *",
      [title, content, category, assignmentId]
    );
    if (results.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: "Server could not find the requested assignment to update",
        });
    }
    return res.status(200).json({ message: "Updated assignment successfully" });
  } catch {
    return res
      .status(500)
      .json({
        message:
          "Server could not update assignment because of a database error",
      });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const results = await connectionPool.query(
      "DELETE FROM assignments WHERE id = $1 RETURNING *",
      [assignmentId]
    );
    if (results.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: "Server could not find the requested assignment to delete",
        });
    }
    return res.status(200).json({ message: "Deleted assignment successfully" });
  } catch {
    return res
      .status(500)
      .json({
        message:
          "Server could not delete assignment because of a database error",
      });
  }
});

// app.get("/test", (req, res) => {
//   return res.json("Server API is working 🚀");
// });

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
