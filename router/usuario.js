import { conexion } from "../db/atlas.js";
import { Router } from "express";

const appUsuario = Router();

let db = await conexion();

let Usuario = db.collection('usuario');

appUsuario.get("/", async(req, res)=>{

    let db = await conexion();
    let Usuario = db.collection('usuario');
    let result = await Usuario.find({}).sort({usu_nombre:1}).toArray();
    res.send(result);

});

appUsuario.get("/:med_nroMatriculaProfesional", async (req, res) => {
    const med_nroMatriculaProfesional = parseInt(req.params.med_nroMatriculaProfesional);
    const Cita = db.collection('cita');
    const Usuario = db.collection('usuario');
    const Medico = db.collection('medico');
    const medico = await Medico.findOne({
        "med_nroMatriculaProfesional": med_nroMatriculaProfesional
    });
    if (!medico) {
        return res.status(404).send("Médico no encontrado.");
    }
    const citasConMedico = await Cita.find({
        "cit_medico": med_nroMatriculaProfesional
    }).toArray();
    const pacienteIds = citasConMedico.map(cita => cita.cit_datosUsuario);
    const pacientes = await Usuario.find({
        "usu_id": { $in: pacienteIds }
    }).toArray();
    res.send(pacientes);
});

appUsuario.get("/consultorias/:usu_id", async (req, res) => {

    const usu_id = parseInt(req.params.usu_id);

    const Cita = db.collection('cita');
    const Medico = db.collection('medico');
    
    const consultoriasPaciente = await Cita.find({
        "cit_datosUsuario": usu_id
    }).toArray();

    const consultoriasDetalladas = [];

    for (const consultoria of consultoriasPaciente) {
        const medico = await Medico.findOne({
            "med_nroMatriculaProfesional": consultoria.cit_medico
        });

        const consultoriaDetallada = {
            cit_codigo: consultoria.cit_codigo,
            cit_fecha: consultoria.cit_fecha,
            cit_estadoCita: consultoria.cit_estadoCita,
            medico: medico
        };

        consultoriasDetalladas.push(consultoriaDetallada);
    }

    res.send(consultoriasDetalladas);
});

export default appUsuario;