import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './Landing'
import Start from './Start'

const Public = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/start" element={<Start />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default Public