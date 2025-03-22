interface MySqlConnectionParams {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
  ssl?: { rejectUnauthorized: boolean };
}