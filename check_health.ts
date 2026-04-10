import { PythonEngineService } from './src/services/PythonEngineService'
PythonEngineService.getInstance().healthCheck().then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error)
