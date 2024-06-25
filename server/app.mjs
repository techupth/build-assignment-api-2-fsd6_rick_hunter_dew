// นำเข้าโมดูล express
import express from "express";
import connectionPool from "./utils/db.mjs";

// สร้างแอปพลิเคชัน express
const app = express();

// กำหนดพอร์ตที่จะใช้ในการฟังคำขอ
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  // ลอจิกในการเก็บข้อมูลของโพสต์ลงในฐานข้อมูล
  // 1) Access ข้อมูลใน Body จาก Request ด้วย req.body
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };
  console.log(req.body);

  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }

  // 2) เขียน Query เพื่อ Insert ข้อมูลโพสต์ ด้วย Connection Pool
  try {
    await connectionPool.query(
      ` insert into assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at )
    values($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newPost.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        1,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }

  // 3) Return ตัว Response กลับไปหา Client ว่าสำเร็จ
  return res.status(201).json({
    message: "Created assignment sucessfully",
  });
});

app.get("/assignments", async (req, res) => {
  // ลอจิกในการอ่านข้อมูลทั้งหมดของโพสต์ในระบบ

  // 1) เขียน Query เพื่อดึงข้อมูลโพสต์ ด้วย Connection Pool
  let results;
  try {
    results = await connectionPool.query(`select * from assignments`);
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  // 2) Return ตัว Response กลับไปหา Client
  return res.status(200).json({
    data: results.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  // ลอคในอ่านข้อมูลโพสต์ด้วย Id ในระบบ
  // 1) Access ตัว Endpoint Parameter ด้วย req.params
  const assignmentIdFromClient = req.params.assignmentId;

  // 2) เขียน Query เพื่ออ่านข้อมูลโพสต์ ด้วย Connection Pool

  let result;
  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  // เพิ่ม Conditional logic ว่าถ้าข้อมูลที่ได้กลับมาจากฐานข้อมูลเป็นค่า false (null / undefined)
  // ก็ให้ Return response ด้วย status code 404
  // พร้อมกับข้อความว่า "Server could not find a requested post (post id: x)"
  if (!results.rows[0]) {
    return res.status(404).json({
      message: `Server could not find a requested assignment (assignment id: ${assignmentIdFromClient})`,
    });
  }

  // 3) Return ตัว Response กลับไปหา Client
  return res.status(200).json({
    data: results.rows[0],
  });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  // ลอจิกในการแก้ไขข้อมูลโพสต์ด้วย Id ในระบบ

  // 1) Access ตัว Endpoint Parameter ด้วย req.params
  // และข้อมูลโพสต์ที่ Client ส่งมาแก้ไขจาก Body ของ Request
  const assignmentIdFromClient = req.params.assignmentId;
  const updatedAssignment = { ...req.body, updated_at: new Date() };

  // 2) เขียน Query เพื่อแก้ไขข้อมูลโพสต์ ด้วย Connection Pool

  let result;
  try {
    result = await connectionPool.query(
      `
    update assignments
    set title = $2,
        content = $3,
        category = $4
    where assignment_id = $1
    returning *
    `,
      [
        assignmentIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }
    // 3) Return ตัว Response กลับไปหา Client
    return res.status(200).json({
      message: "Updated assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  // ลอจิกในการลบข้อมูลโพสต์ด้วย Id ในระบบ

  // 1) Access ตัว Endpoint Parameter ด้วย req.params
  const assignmentIdFromClient = req.params.assignmentId;

  // 2) เขียน Query เพื่อลบข้อมูลโพสต์ ด้วย Connection Pool

  let result;
  try {
    result = await connectionPool.query(
      `
    delete from assignments where assignment_id = $1 returning *
    `,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Server could not find a requested assignment to delete ( assignment id: ${assignmentIdFromClient})`,
    });
  }
  // 3) Return ตัว Response กลับไปหา Client
  return res.status(200).json({
    message: "Deleted assignment successfully",
  });
});

app.listen(port, () => {
  // เมื่อเริ่มต้นเซิร์ฟเวอร์ให้ฟังพอร์ตที่ระบุ และพิมพ์ข้อความใน console
  console.log(`Server is running at ${port}`);
});
