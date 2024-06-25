import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json())

app.get("/assignments", async(req,res)=>{
  try{const results = await connectionPool.query(

    `select * from assignments`
    
  )
  return res.status(200).json({data: results.rows})
  
  }catch{
    return res.status(500).json({
      "message": "Server could not read assignment because database connection"
    })
  }
})

app.get("/assignments/:assignmentId",async (req,res)=>{
  let result;
  
  try{
    const assignmentIdonClient= req.params.assignmentId

   result = await connectionPool.query(

    `select * from assignments where assignment_Id=$1`,

    [assignmentIdonClient]
  );
}catch{
  return res.status(500).json({
    "message": "Server could not read assignment because database connection"
  })
}
if(!result.rows[0]){
  return res.status(404).json({
    message: "Server could not find a requested assignment" })
}

return res.status(200).json({
  data: result.rows[0]
})

})
app.post("/assignments", async (req,res)=>{
  const newAssignment ={
   ...req.body
  }
  try{
   await connectionPool.query(
     `insert into assignments(title,content,category)
     values($1,$2,$3)`,
     [ 
       newAssignment.title,
       newAssignment.content,
       newAssignment.category
     ]
   )
  }catch{
 return res.status(500).json(
   { "message": "Server could not create assignment because database connection" })
 }
 
 if(!newAssignment.title || !newAssignment.category){
   return res.status(400).json({
     "message":"Server could not create assignment because there are missing data from client"
   })
 }
 return res.status(201).json(
   { "message": "Created assignment sucessfully" })
 })

app.put("/assignments/:assignmentId",async (req,res)=>{
  let result;
  const assignmentIdonClient = req.params.assignmentId
  const newAssignment ={
    ...req.body
   }
  try{
    result = await connectionPool.query(
      `update assignments 
      set title=$2,
      content=$3,
      category=$4
      where assignment_id =$1
      returning *`,

      [assignmentIdonClient,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category
      ]
    )
  }catch{
    return res.status(500).json({
      "message": "Server could not update assignment because database connection"
    })
  }
  if(!result.rows[0]){
    return res.status(404).json({
      "message": "Server could not find a requested assignment to update"
    })
  }
  return res.status(200).json(
    { "message": "Updated assignment sucessfully"})
  })

app.delete("/assignments/:assignmentId",async(req,res)=>{
  const assignmentIdFromClient = req.params.assignmentId
  let result;
  try{
    result = await connectionPool.query(
      `delete from assignments where assignment_id = $1 returning * `,
      [assignmentIdFromClient]
    );
  }catch{
    return res.status(500).json({"message": "Server could not delete assignment because database connection"

    })
  }
  if(!result.rows[0]){
    return res.status(404).json({
      "message": "Server could not find a requested assignment to delete" 
    })
  }
  return res.status(200).json({"message": "Deleted assignment sucessfully"})
})

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
