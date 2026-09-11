import {app} from './app.ts'
import 'dotenv/config'
const port = Number(process.env.port ?? 3000);

app.listen(port, () => {
    console.log(`Backend app listening on port ${port}`);
});