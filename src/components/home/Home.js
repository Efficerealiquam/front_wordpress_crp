import React, { useState } from 'react'
import "./Home.css"
import { useDropzone } from 'react-dropzone'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {SiMicrosoftexcel} from 'react-icons/si'


const Home = () => {
    const [selectedFile, setSelectedFile] = useState(null)
    const [errors, setErrors] = useState({ errorfile: "" })
    const { acceptedFiles, fileRejections, getRootProps, getInputProps } = useDropzone({
        accept: {
            'text/csv': []
        },
        maxFiles: 1,
        onDropAccepted: (acceptedFiles) => {
            setSelectedFile(acceptedFiles[0]);
            setErrors({ errorfile: "" })
        }
    });
    const handleFileSubmit = async () => {
        if (selectedFile) {
            try {
                const infoToast = toast('Convirtiendo y formateando el archivo...', { type: 'info' });
                const formData = new FormData();
                formData.append('file', selectedFile);
                const response = await fetch('https://api-wordpress-crp.onrender.com/excel/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    toast.dismiss(infoToast);
                    const currentDate = new Date().toLocaleDateString('es-ES');
                    // Convierte la respuesta en un blob
                    const blob = await response.blob();

                    // Crea un objeto URL para el blob
                    const url = window.URL.createObjectURL(blob);
                    const fileName = `Escuelita_${currentDate}.xlsx`;
                    // Crea un enlace de descarga invisible
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName; // Define el nombre del archivo
                    a.style.display = 'none';

                    // Agrega el enlace al DOM y simula un clic
                    document.body.appendChild(a);
                    a.click();

                    // Limpia el objeto URL y remueve el enlace
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    setSelectedFile(null)

                    toast('Se descarga de forma exitosa el Excel.', { type: 'success' });
                } else {
                    console.error('Error al enviar el archivo a la API');
                    toast('Ups! Ocurrió un error en la conversion del archivo.', { type: 'error' });
                }
            } catch (error) {
                console.error('Error en la solicitud: ', error);
            }
        } else {
            setErrors({ errorfile: "*Seleccione un archivo CSV" })
        }
    }

    const files = acceptedFiles.map(file => (
        <li key={file.path} className='list_excel' >
           <SiMicrosoftexcel/> {file.path} - {file.size} bytes
        </li>
    ));

    const fileRejectionItems = fileRejections.map(({ file, errors }) => {
        return (
            <li key={file.path} className='list_excel'>
                <SiMicrosoftexcel/> {file.path} - {file.size} bytes
            </li>
        )
    });
    return (
        <div className='container_body' >
            <section className='container' >
                <div className='title'>
                    <span>Conversión del archivo CSV de WordPress a Excel y adición de URL de archivos adjuntos (CV y audio del piloto)</span>
                </div>
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p>Arrastre y suelte su archivo CSV aquí o haga clic para seleccionar su archivo</p>
                    {selectedFile && <ul style={{marginTop:"5px"}} >{files}</ul>}
                </div>
                {errors.errorfile && <div className="error-input">{errors.errorfile}</div>}
                <div>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded btn_custom' onClick={handleFileSubmit}>Enviar Archivo</button>
                </div>
                <div className='footer_options'>
                    <div className='cont_text' >
                        <span className='text_footer' >Archivo recibido:</span>
                        <ul>{files}</ul>
                    </div>
                    <div className='cont_text' >
                        <span className='text_footer' >Archivos Rechazados:</span>
                        <ul>{fileRejectionItems}</ul>
                    </div>
                </div>
            </section>
            <ToastContainer
                position='bottom-center'
                closeOnClick
                transition={Bounce}
                theme='light'
            />
        </div>
    )
}

export default Home