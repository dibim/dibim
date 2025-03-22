interface PostgresConnectionParams {
  user: string;
  host: string;
  dbname: string;
  password: string;
  port: number;
  ssl?: boolean | { rejectUnauthorized: boolean };
}
