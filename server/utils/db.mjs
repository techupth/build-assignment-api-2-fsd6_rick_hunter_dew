// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:132611@localhost:5432/testd",
});

export default connectionPool;
