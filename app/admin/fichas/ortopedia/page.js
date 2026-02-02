'use client';

import { useState, Fragment, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    XMarkIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    ClipboardDocumentCheckIcon,
    DocumentTextIcon,
    DocumentTextIcon as DocumentTextIconOutline,
    UserIcon,
    FaceSmileIcon,
    CalculatorIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ListBulletIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import PDF components
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false }
);

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ortopediaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    cedula: z.string().min(1, 'La cédula es requerida'),
    edad: z.coerce.number().min(0, 'Edad inválida'),
    pais_ciudad: z.string().optional(),
    tutor: z.string().optional(),
    celular: z.string().optional(),
    // Section 1 additions
    gustos_personales: z.string().optional(),
    queja_principal: z.string().optional(),
    habitos_succion: z.string().optional(),
    historia_medica: z.string().optional(),
    historico_accidentes: z.string().optional(),
    estructura_familiar: z.string().optional(),
    indice_colaboracion: z.enum(['Alto', 'Medio', 'Bajo']).optional().or(z.literal('')).nullable(),
    indice_colaboracion_obs: z.string().optional(),
    higiene_oral: z.enum(['Adecuada', 'Deficiente']).optional().or(z.literal('')).nullable(),
    menstruacion: z.enum(['Si', 'No']).optional().or(z.literal('')).nullable(),
    necesidad_tratamiento: z.string().optional(),
    hereditariedad: z.string().optional(),
    // Section 2 - Análisis Facial additions
    s2_tipo_facial: z.enum(['Mesofacial', 'Dolicofacial', 'Braquifacial']).optional().or(z.literal('')).nullable(),
    s2_convexidad: z.enum(['Recto', 'Cóncavo', 'Convexo']).optional().or(z.literal('')).nullable(),
    s2_tercios_proporcion: z.enum(['Proporcionales', 'Sin proporción con tercios aumentados', 'Sin proporción con tercios diminuído']).optional().or(z.literal('')).nullable(),
    s2_tercios_superior: z.boolean().optional(),
    s2_tercios_medio: z.boolean().optional(),
    s2_tercios_inferior: z.boolean().optional(),
    s2_sellado_labial: z.enum(['Pasivo', 'Comprensivo']).optional().or(z.literal('')).nullable(),
    s2_relacion_labios: z.enum(['Labio superior delante del inferior', 'Labio inferior delante del labio superior']).optional().or(z.literal('')).nullable(),
    s2_simetria_reposo: z.enum(['Paciente simétrico', 'Paciente asimétrico']).optional().or(z.literal('')).nullable(),
    s2_simetria_reposo_der: z.boolean().optional(),
    s2_simetria_reposo_izq: z.boolean().optional(),
    s2_simetria_apertura: z.enum(['Presenta', 'No presenta']).optional().or(z.literal('')).nullable(),
    s2_simetria_apertura_der: z.boolean().optional(),
    s2_simetria_apertura_izq: z.boolean().optional(),
    // Section 2.8-2.13 additions
    s2_angulo_nasolabial: z.enum(['Normal', 'Abierto', 'Disminuido']).optional().or(z.literal('')).nullable(),
    s2_surco_mentolabial: z.enum(['Normal', 'Profundo', 'Poco Profundo']).optional().or(z.literal('')).nullable(),
    s2_proyeccion_cigomatica: z.enum(['Normal', 'Aumentada', 'Deficiente']).optional().or(z.literal('')).nullable(),
    s2_linea_menton_cuello: z.enum(['Normal', 'Aumentada', 'Disminuida']).optional().or(z.literal('')).nullable(),
    s2_angulo_menton_cuello: z.enum(['Normal', 'Abierto', 'Cerrado']).optional().or(z.literal('')).nullable(),
    s2_patron_facial: z.enum(['Patron I', 'Patron II', 'Patron III', 'Cara Corta', 'Cara Larga']).optional().or(z.literal('')).nullable(),
    s2_patron_ii_retrusion_mand: z.boolean().optional(),
    s2_patron_ii_protrusion_max: z.boolean().optional(),
    s2_patron_ii_aumento_afai: z.boolean().optional(),
    s2_patron_ii_disminuida_afai: z.boolean().optional(),
    s2_patron_iii_protrusion_mand: z.boolean().optional(),
    s2_patron_iii_retrusion_max: z.boolean().optional(),
    s2_patron_iii_aumento_afai: z.boolean().optional(),
    s2_patron_iii_disminuida_afai: z.boolean().optional(),
    // Section 3 - Análisis Oclusal
    s3_oclusion_manipulacion: z.enum(['RC = MIH', 'RC != MIH']).optional().or(z.literal('')).nullable(),
    s3_relacion_transversal: z.enum(['Brodie', 'Normal', 'Mordida cruzada posterior bilateral', 'Mordida cruzada posterior unilateral lado']).optional().or(z.literal('')).nullable(),
    s3_transversal_derecho: z.boolean().optional(),
    s3_transversal_izquierdo: z.boolean().optional(),
    s3_caracteristica_mordida: z.enum(['Esqueletal', 'Dento-alveolar', 'No presenta']).optional().or(z.literal('')).nullable(),
    s3_relacion_vertical: z.enum(['Normal', 'Bis a bis/borde a borde', 'Mordida profunda de', 'Mordida abierta de']).optional().or(z.literal('')).nullable(),
    s3_vertical_milimetros: z.string().optional(),
    // Section 3.5-3.7
    s3_curva_spee: z.enum(['Normal', 'Alterada']).optional().or(z.literal('')).nullable(),
    s3_curva_alt_extrusion_inf: z.boolean().optional(),
    s3_curva_alt_extrusion_sup: z.boolean().optional(),
    s3_curva_alt_intrusion: z.boolean().optional(),
    s3_curva_alt_molares_extruidos: z.boolean().optional(),
    s3_curva_alt_molares_instruidos: z.boolean().optional(),
    s3_relacion_sagital: z.enum(['Normal', 'Overjet aumentado de', 'Mordida cruzada anterior de']).optional().or(z.literal('')).nullable(),
    s3_sagital_milimetros: z.string().optional(),
    s3_caninos_mih_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    s3_caninos_mih_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    // Section 3.8-3.9
    s3_molares_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    s3_molares_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    s3_caninos_rc_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    s3_caninos_rc_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    // Section 3.10 (MIH Molares duplicate for form structure)
    s3_molares_mih_derecho: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    s3_molares_mih_izquierdo: z.enum(['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa']).optional().or(z.literal('')).nullable(),
    // Section 3.11-3.14
    s3_linea_media: z.enum(['Coincidentes']).optional().or(z.literal('')).nullable(),
    s3_linea_media_superior_desviada: z.boolean().optional(),
    s3_linea_media_inferior_desviada: z.boolean().optional(),
    s3_linea_media_milimetros: z.string().optional(),
    s3_anomalias_dentales: z.string().optional(),
    s3_condicion_atm: z.string().optional(),
    s3_familiar_maloclusion: z.string().optional(),
    // Section 4 - Análisis Cefalométrico
    s4_bases_apicales: z.string().optional(),
    s4_tendencia_crecimiento: z.string().optional(),
    s4_aspectos_dentoalveolares: z.string().optional(),
    // Section 5 - Diagnóstico Funcional
    s5_tipo_respiracion: z.enum(['Oral', 'Nasal', 'Oronasal']).optional().or(z.literal('')).nullable(),
    s5_frenillo_labial: z.enum(['Normal', 'Muy inserido']).optional().or(z.literal('')).nullable(),
    s5_ronca: z.enum(['Sí', 'No']).optional().or(z.literal('')).nullable(),
    s5_prueba_habla: z.enum(['Habla normal', 'Habla imprecisa']).optional().or(z.literal('')).nullable(),
    s5_desgastes_bruxismo: z.enum(['No hay desgastes', 'Desgastes en piezas temporales', 'Desgastes en piezas temporales y permanentes']).optional().or(z.literal('')).nullable(),
    // Section 6-9 (Treatment Planning Boxes 5-8)
    s6_lista_problemas: z.string().optional(),
    s7_metas_tratamiento: z.string().optional(),
    s8_secuencia_tratamiento: z.string().optional(),
    s9_proximas_etapas: z.string().optional(),
    // Section 13 - Plan de Tratamiento Final
    s13_plan_tratamiento_final: z.string().optional(),
    s13_fecha: z.string().optional(),
    s13_firma_paciente: z.string().optional(),
    s13_firma_doctor: z.string().optional(),
    // New high-level categories
    s14_justificacion_clinica: z.string().optional().or(z.literal('')).nullable(),
    s14_justificacion_texto: z.string().optional().or(z.literal('')).nullable(),
    s14_f1_filas: z.array(z.object({
        categoria: z.string().optional().or(z.literal('')).nullable(),
        tratamiento_detalle: z.string().optional().or(z.literal('')).nullable(),
        objetivo: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s14_f1_ppto_detalle: z.string().optional().or(z.literal('')).nullable(),
    s14_f1_total: z.string().optional().or(z.literal('')).nullable(),
    s14_f2_filas: z.array(z.object({
        categoria: z.string().optional().or(z.literal('')).nullable(),
        tratamiento_detalle: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s14_justificacion_imagenes: z.array(z.string()).max(3).optional().default([]),
    s14_justificacion_recomendaciones: z.string().optional().or(z.literal('')).nullable(),
    s14_ind_adicionales: z.string().optional().or(z.literal('')).nullable(),
    s15_ppto_tratamiento: z.string().optional().or(z.literal('')).nullable(),
    s15_ppto_aparato: z.string().optional().or(z.literal('')).nullable(),
    s15_ppto_abono: z.string().optional().or(z.literal('')).nullable(),
    s15_ppto_total: z.string().optional().or(z.literal('')).nullable(),
    s15_ppto_nota: z.string().optional().or(z.literal('')).nullable(),
    s15_indicaciones_paciente: z.string().optional().or(z.literal('')).nullable(),
    s16_registro_pago_ortodoncia: z.string().optional().or(z.literal('')).nullable(),
    s16_resumen_cuotas_ortopedia: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_fecha: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_total_tratamiento: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_tiempo_estimado: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_cuota_mensual: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_aparato_footer: z.string().optional().or(z.literal('')).nullable(),
    s16_ppto_pagos_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        valor: z.string().optional().or(z.literal('')).nullable(),
        forma_pago: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    s16_proc_fecha: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_aparatos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_unmaxilar: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_bimaxilar: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_auxiliares: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_hallazgos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_objetivos: z.string().optional().or(z.literal('')).nullable(),
    s16_proc_filas: z.array(z.object({
        fecha: z.string().optional().or(z.literal('')).nullable(),
        mes: z.string().optional().or(z.literal('')).nullable(),
        observaciones: z.string().optional().or(z.literal('')).nullable(),
    })).optional(),
    // Images gallery storage
    imagenes: z.array(z.object({
        date: z.string(),
        data: z.array(z.string())
    })).optional().default([]),
    // Placeholder for other sections to avoid breaking
    section3_textarea: z.string().optional(),
    section4_textarea: z.string().optional(),
    section5_textarea: z.string().optional(),
    section6_textarea: z.string().optional(),
    section10_textarea: z.string().optional(),
    section11_textarea: z.string().optional(),
});

// Import PDF Document
import OrtopediaDocument from '@/components/pdf/OrtopediaDocument';
import ModalGalleryFicha from '@/components/modals/ModalGalleryFicha';

export default function OrtopediaFichasPage() {
    const router = useRouter();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [recordId, setRecordId] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [mainAccordion, setMainAccordion] = useState(null); // null: Todo cerrado, 1: Formulario, 2: Justificacion, 3: Indicaciones
    const [subAccordion, setSubAccordion] = useState(null); // Inside Paso 2.4

    // Refs for auto-scroll
    const acc1Ref = useRef(null);
    const acc2Ref = useRef(null);
    const acc3Ref = useRef(null);
    const acc4Ref = useRef(null);
    const subAcc1Ref = useRef(null);
    const subAcc2Ref = useRef(null);

    const scrollToRef = (ref) => {
        setTimeout(() => {
            if (ref.current) {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm({
        resolver: zodResolver(ortopediaSchema),
        defaultValues: {
            step: 1,
            s14_f1_filas: [{ categoria: '', tratamiento_detalle: '', objetivo: '' }],
            s14_f2_filas: [{ categoria: '', tratamiento_detalle: '' }],
            s14_justificacion_imagenes: [],
            s14_justificacion_recomendaciones: '',
            s15_ppto_tratamiento: 'Ortopedia\nTiempo estimado 1 año +/- 3 meses aproximadamente',
            s15_ppto_aparato: 'Aparato Ortopédico bimaxilar\n\nEn caso de perdida',
            s15_ppto_abono: '',
            s15_ppto_total: '$',
            s15_ppto_nota: 'Los aparatos ortopédicos se activan 1 o 2 veces por mes, y necesitamos colaboración tanto del niño como del representante',
            s16_registro_pago_ortodoncia: '',
            s16_resumen_cuotas_ortopedia: '',
            s16_ppto_fecha: new Date().toLocaleDateString('es-ES'),
            s16_ppto_total_tratamiento: '',
            s16_ppto_tiempo_estimado: '',
            s16_ppto_cuota_mensual: '',
            s16_ppto_aparato_footer: '',
            s16_ppto_pagos_filas: Array.from({ length: 16 }, () => ({ fecha: '', mes: '', valor: '', forma_pago: '' })),
            s16_proc_fecha: new Date().toISOString().split('T')[0],
            s16_proc_aparatos: '',
            s16_proc_unmaxilar: '',
            s16_proc_bimaxilar: '',
            s16_proc_auxiliares: '',
            s16_proc_hallazgos: '',
            s16_proc_objetivos: '',
            s16_proc_filas: Array.from({ length: 21 }, () => ({ fecha: '', mes: '', observaciones: '' }))
        }
    });

    const { fields: f1Fields, append: f1Append, remove: f1Remove } = useFieldArray({
        control,
        name: "s14_f1_filas"
    });

    const { fields: f2Fields, append: f2Append, remove: f2Remove } = useFieldArray({
        control,
        name: "s14_f2_filas"
    });

    const { fields: pptoPagosFields, append: pptoPagosAppend, remove: pptoPagosRemove } = useFieldArray({
        control,
        name: "s16_ppto_pagos_filas"
    });

    const { fields: procFilasFields, append: procFilasAppend, remove: procFilasRemove } = useFieldArray({
        control,
        name: "s16_proc_filas"
    });

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfData, setPdfData] = useState({});

    const formData = watch();

    // Add state for patient history images
    const [patientHistoryImages, setPatientHistoryImages] = useState([]);

    useEffect(() => {
        const fetchPatientHistory = async () => {
            if (formData.cedula && step === 2) {
                try {
                    // Fetch ALL fichas for this patient to get their full gallery
                    const response = await fetch(`/api/fichas?cedula=${formData.cedula}`);
                    if (response.ok) {
                        const data = await response.json();
                        // Extract all images from all fichas EXCEPT the current one
                        const history = data.fichas
                            .filter(f => f.id !== recordId)
                            .map(f => f.data.imagenes || []).flat();
                        // Flatten the nested structure (groups -> data)
                        const flatImages = history
                            .flatMap(group => group.data || [])
                            .filter(img => img); // Remove empty/null

                        setPatientHistoryImages(flatImages.slice(0, 20));
                    }
                } catch (error) {
                    console.error("Error fetching patient history:", error);
                }
            } else if (!formData.cedula) {
                setPatientHistoryImages([]);
            }
        };

        const timer = setTimeout(() => {
            fetchPatientHistory();
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.cedula, step]);

    useEffect(() => {
        // CLEANUP: Ensure selected images for PDF still exist in the available pool
        // This prevents "ghost" images if history changes or images are deleted
        const currentImages = watch('imagenes')?.flatMap(group => group.data || []) || [];
        const availablePool = [...currentImages, ...patientHistoryImages];
        const selectedImages = watch('s14_justificacion_imagenes') || [];

        if (selectedImages.length > 0 && availablePool.length > 0) {
            const validSelection = selectedImages.filter(img => availablePool.includes(img));
            if (validSelection.length !== selectedImages.length) {
                setValue('s14_justificacion_imagenes', validSelection)
            }
        }
    }, [patientHistoryImages, watch('imagenes'), setValue, watch]);

    const refreshPDF = () => {
        const mode = mainAccordion === 4 ? (subAccordion === 1 ? 4 : (subAccordion === 2 ? 5 : 4)) : mainAccordion;
        // Deep clone to prevent reference sharing which causes auto-updates
        setPdfData(JSON.parse(JSON.stringify({ ...formData, pdfMode: mode })));
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const toggleSection = (sectionId) => {
        setActiveSection(prev => prev === sectionId ? null : sectionId);
    };

    useEffect(() => {
        if (searchTerm) {
            const filtered = clients.filter(client =>
                client.data.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.data.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/fichas?type=ortopedia');
            if (response.ok) {
                const data = await response.json();
                setClients(data.fichas || []);
                setFilteredClients(data.fichas || []);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sections = [
        { id: 1, title: '1. Datos del Paciente', icon: UserIcon },
        { id: 2, title: '2. Historia Clínica Ortodóntica', icon: DocumentTextIcon },
        { id: 3, title: '3. Análisis Oclusal', icon: FaceSmileIcon },
        { id: 4, title: '4. Análisis Cefalométrico', icon: CalculatorIcon },
        { id: 5, title: '5. Diagnóstico Funcional', icon: DocumentTextIcon },
        { id: 6, title: '6. Lista de Problemas', icon: ClipboardDocumentCheckIcon },
        { id: 7, title: '7. Metas del Tratamiento', icon: ClipboardDocumentCheckIcon },
        { id: 8, title: '8. Secuencia del Tratamiento', icon: ClipboardDocumentCheckIcon },
        { id: 9, title: '9. Posibles Próximas Etapas', icon: ClipboardDocumentCheckIcon },
        { id: 10, title: '10. Plan de Tratamiento Final', icon: ClipboardDocumentCheckIcon },
    ];

    const visibleSections = step === 1 ? sections.filter(s => s.id === 1) : sections;

    const openModal = () => {
        setStep(1);
        setRecordId(null);
        setActiveSection(null);
        setMainAccordion(null);
        setIsModalOpen(true);
        setPdfData({});
        setPatientHistoryImages([]);
        reset();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setStep(1);
        setRecordId(null);
        setPatientHistoryImages([]);
        reset();
    };

    const editClient = (client) => {
        setRecordId(client.id);
        setStep(2);
        setActiveSection(null);
        setMainAccordion(null);
        setIsModalOpen(true);
        setPdfData(client.data);
        setPatientHistoryImages([]); // Clear while loading new patient
        reset(client.data);
    };

    const onSubmit = async (data) => {
        setIsSaving(true);
        const isUpdate = step === 2 && recordId;

        try {
            const response = await fetch('/api/fichas', {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fichaType: 'ortopedia',
                    id: recordId,
                    data: data,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                const result = await response.json();
                if (step === 1) {
                    setRecordId(result.id);
                    setStep(2);
                    setActiveSection(2);
                } else {
                    alert('Ficha de Ortopedia guardada exitosamente');
                    // closeModal(); // Keep modal open
                    fetchClients();
                }
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/fichas')}
                            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
                        >
                            ← Volver
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ortopedia</h1>
                    <p className="text-gray-600">Gestión de fichas de clientes</p>
                </div>

                <div className="flex gap-2">
                    <a
                        href="/indicaciones-postquirurgicas.pdf"
                        download
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all shadow-md"
                    >
                        <DocumentTextIconOutline className="h-5 w-5" />
                        <span className="hidden sm:inline">Indicaciones Postquirúrgicas</span>
                        <span className="sm:hidden">Post-Op</span>
                    </a>

                    <a
                        href="/recomendaciones-clareamiento.pdf"
                        download
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-pink-600 text-pink-600 rounded-xl font-medium hover:bg-pink-50 transition-all shadow-md"
                    >
                        <DocumentTextIconOutline className="h-5 w-5" />
                        <span className="hidden sm:inline">Recomendaciones Clareamiento</span>
                        <span className="sm:hidden">Clareamiento</span>
                    </a>

                    <button
                        onClick={openModal}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Clients List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="text-gray-600">Cargando clientes...</div>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="text-gray-400 mb-4">
                        <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto mb-3" />
                        {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </div>
                    {!searchTerm && (
                        <button
                            onClick={openModal}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Crear Primer Cliente
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <span className="text-xs text-gray-500">ID: {client.id.slice(0, 8)}</span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1">
                                {client.data.nombre || 'Sin nombre'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {new Date(client.timestamp).toLocaleDateString('es-ES')}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => editClient(client)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                    Ver/Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create New Client Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                    {/* Modal Header */}
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            {step === 1 ? 'Nueva Ficha Ortopedia' : `Ortopedia: ${formData.nombre || ''}`}
                                        </Dialog.Title>
                                        <button
                                            onClick={closeModal}
                                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <div className={`grid grid-cols-1 ${step === 2 ? 'lg:grid-cols-2' : ''} gap-6`}>
                                                {/* Left Column - Form with Accordion */}
                                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                                                    {step === 1 ? (
                                                        <div className="space-y-4">
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro Inicial de Paciente</h3>
                                                            {visibleSections.filter(s => s.id === 1).map((section) => (
                                                                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                                    <div className="px-5 py-5">
                                                                        {/* Contenido de la Sección 1 (Datos Paciente) */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-slate-700 uppercase">Nombre Completo</label>
                                                                                <input {...register('nombre')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                {errors.nombre && <p className="text-red-500 text-[10px] font-bold">{errors.nombre.message}</p>}
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="space-y-2">
                                                                                    <label className="text-xs font-bold text-slate-700 uppercase">Cédula/ID</label>
                                                                                    <input {...register('cedula')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                    {errors.cedula && <p className="text-red-500 text-[10px] font-bold">{errors.cedula.message}</p>}
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-xs font-bold text-slate-700 uppercase">Edad</label>
                                                                                    <input type="number" {...register('edad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                    {errors.edad && <p className="text-red-500 text-[10px] font-bold">{errors.edad.message}</p>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-slate-700 uppercase">País y Ciudad</label>
                                                                                <input {...register('pais_ciudad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-slate-700 uppercase">Nombre del Tutor</label>
                                                                                <input {...register('tutor')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-slate-700 uppercase">Celular Contacto</label>
                                                                                <input {...register('celular')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                            </div>
                                                                        </div>
                                                                        {/* Otros campos básicos de la sección 1 si es necesario, pero usualmente son estos 3 los mandatorios */}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {/* Main Accordion 1: Formulario */}
                                                            <div ref={acc1Ref} className={`rounded-xl border-2 transition-all ${mainAccordion === 1 ? 'border-purple-500 bg-purple-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const isOpen = mainAccordion === 1;
                                                                        setMainAccordion(isOpen ? null : 1);
                                                                        if (!isOpen) scrollToRef(acc1Ref);
                                                                    }}
                                                                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg ${mainAccordion === 1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                            <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.1</p>
                                                                            <h3 className={`text-sm font-black uppercase ${mainAccordion === 1 ? 'text-purple-700' : 'text-slate-700'}`}>1. Formulario Clínico</h3>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 1 ? 'rotate-180' : ''}`} />
                                                                </button>

                                                                {mainAccordion === 1 && (
                                                                    <div className="px-5 pb-5 space-y-3 pt-2">
                                                                        {sections.map((section) => (
                                                                            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => toggleSection(section.id)}
                                                                                    className="flex w-full justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                                                                                >                                   <div className="flex items-center gap-3 text-purple-900">
                                                                                        <section.icon className="h-5 w-5" />
                                                                                        <span className="font-bold uppercase text-sm">{section.title}</span>
                                                                                    </div>
                                                                                    <ChevronDownIcon
                                                                                        className={`h-5 w-5 text-purple-600 transition-transform duration-200 ${activeSection === section.id ? 'rotate-180' : ''}`}
                                                                                    />
                                                                                </button>

                                                                                {activeSection === section.id && (
                                                                                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 text-xs font-semibold uppercase text-slate-700">
                                                                                        {section.id === 1 && (
                                                                                            <div className="space-y-4">
                                                                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                                                                    <div className="md:col-span-8 space-y-1">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.1. Nombre del paciente *</label>
                                                                                                        <input {...register('nombre')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        {errors.nombre && <p className="text-red-500 text-[10px] lowercase">{errors.nombre.message}</p>}
                                                                                                    </div>
                                                                                                    <div className="md:col-span-4 space-y-1">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Edad *</label>
                                                                                                        <input type="number" {...register('edad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        {errors.edad && <p className="text-red-500 text-[10px] lowercase">{errors.edad.message}</p>}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="space-y-1">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">1.2. País y ciudad del paciente</label>
                                                                                                    <input {...register('pais_ciudad')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                </div>

                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                                    <div className="space-y-1">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">1.3. Nombre del tutor</label>
                                                                                                        <input {...register('tutor')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                    </div>
                                                                                                    <div className="space-y-1">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Hexadent ID / Cédula *</label>
                                                                                                        <input {...register('cedula')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        {errors.cedula && <p className="text-red-500 text-[10px] lowercase">{errors.cedula.message}</p>}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="space-y-1">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Celular Contacto</label>
                                                                                                    <input {...register('celular')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                </div>

                                                                                                {/* New Fields 1.4 - 1.14 (Only in Step 2) */}
                                                                                                {step === 2 && (
                                                                                                    <div className="space-y-4 pt-4 border-t border-slate-200">
                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.4 Gustos personales (color, canal preferido en youtube, juguetes)</label>
                                                                                                            <textarea {...register('gustos_personales')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.5 Queja principal - ¿Porqué buscó tratamiento?</label>
                                                                                                            <textarea {...register('queja_principal')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.6 Hábitos de succión</label>
                                                                                                            <textarea {...register('habitos_succion')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.7 Historia médica/medicación de uso contínuo.</label>
                                                                                                            <textarea {...register('historia_medica')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.8 Histórico de accidentes o traumas.</label>
                                                                                                            <textarea {...register('historico_accidentes')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.9 Estructura familiar</label>
                                                                                                            <textarea {...register('estructura_familiar')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-2">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.10 Índice de colaboración/cooperacion</label>
                                                                                                            <div className="flex flex-wrap gap-4 items-center">
                                                                                                                {['Alto', 'Medio', 'Bajo'].map((opt) => (
                                                                                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                        <input type="radio" value={opt} {...register('indice_colaboracion')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                                    </label>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                            <div className="mt-2 space-y-1">
                                                                                                                <label className="text-[9px] text-slate-400 italic">Obs.: Pregunte al tutor sobre la cooperación en las actividades diárias para llenar este campo.</label>
                                                                                                                <input {...register('indice_colaboracion_obs')} placeholder="Observaciones de colaboración..." className="w-full p-2 bg-slate-50 border-b border-slate-200 outline-none focus:border-purple-500 font-bold text-xs" />
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="space-y-2">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.11 Higiene oral:</label>
                                                                                                            <div className="flex gap-6 items-center">
                                                                                                                {['Adecuada', 'Deficiente'].map((opt) => (
                                                                                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                        <input type="radio" value={opt} {...register('higiene_oral')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                                    </label>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="space-y-2">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.12 ¿La 1ª menstruación ya ocurrió? (Contestar solo para niña)</label>
                                                                                                            <div className="flex gap-6 items-center">
                                                                                                                {['Si', 'No'].map((opt) => (
                                                                                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                        <input type="radio" value={opt} {...register('menstruacion')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                        <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                                    </label>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.13 Necessidad de tratamiento general (cáries, entodoncia, exodoncia).</label>
                                                                                                            <textarea {...register('necesidad_tratamiento')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>

                                                                                                        <div className="space-y-1">
                                                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">1.14 Características importantes de la hereditariedad.</label>
                                                                                                            <textarea {...register('hereditariedad')} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 2 && (
                                                                                            <div className="space-y-6">
                                                                                                {/* 2.1 Tipo Facial */}
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.1. TIPO FACIAL:</label>
                                                                                                    <div className="flex flex-wrap gap-4 items-center">
                                                                                                        {['Mesofacial', 'Dolicofacial', 'Braquifacial'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_tipo_facial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.2 Convexidad */}
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.2. CONVEXIDAD FACIAL:</label>
                                                                                                    <div className="flex flex-wrap gap-4 items-center">
                                                                                                        {['Recto', 'Cóncavo', 'Convexo'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_convexidad')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.3 Proporcion Tercios */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.3. PROPORCIÓN DE LOS TERCIOS FACIALES:</label>
                                                                                                    <div className="space-y-2">
                                                                                                        {['Proporcionales', 'Sin proporción con tercios aumentados', 'Sin proporción con tercios diminuído'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_tercios_proporcion')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="flex flex-wrap gap-4 mt-2 px-4 py-2 bg-slate-50 rounded-lg">
                                                                                                        {['Superior', 'Inferior', 'Medio'].map((part) => (
                                                                                                            <label key={part} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="checkbox" {...register(`s2_tercios_${part.toLowerCase()}`)} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-[10px] font-bold uppercase">{part}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.4 Sellado Labial */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.4. SELLADO LABIAL:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Pasivo', 'Comprensivo'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_sellado_labial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.5 Relacion labios */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.5 RELACIÓN ANTERO-POSTERIOR DE LÁBIOS:</label>
                                                                                                    <div className="space-y-2">
                                                                                                        {['Labio superior delante del inferior', 'Labio inferior delante del labio superior'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_relacion_labios')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.6 Simetria Reposo */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.6 SIMETRÍA FACIAL EN REPOSO</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        {['Paciente simétrico', 'Paciente asimétrico'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_simetria_reposo')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 px-4 py-2 bg-slate-50 rounded-lg">
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s2_simetria_reposo_der')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Desviación hacia la derecha</span>
                                                                                                        </label>
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s2_simetria_reposo_izq')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Desviación hacia la izquierda</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.7 Simetria Apertura */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.7 SIMETRÍA FACIAL EN APERTURA BUCAL</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        {['Presenta', 'No presenta'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_simetria_apertura')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 px-4 py-2 bg-slate-50 rounded-lg">
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s2_simetria_apertura_der')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Desviación hacia la derecha</span>
                                                                                                        </label>
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s2_simetria_apertura_izq')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Desviación hacia la izquierda</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.8 Angulo Nasolabial */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.8. ÁNGULO NASOLABIAL:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Normal', 'Abierto', 'Disminuido'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_angulo_nasolabial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.9 Surco Mentolabial */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.9. SURCO MENTOLABIAL:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Normal', 'Profundo', 'Poco Profundo'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_surco_mentolabial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.10 Proyeccion Cigomatica */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.10. PROYECCIÓN CIGOMÁTICA:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Normal', 'Aumentada', 'Deficiente'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_proyeccion_cigomatica')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.11 Linea Menton-Cuello */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.11. LÍNEA MENTÓN-CUELLO:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Normal', 'Aumentada', 'Disminuida'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_linea_menton_cuello')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.12 Angulo Menton-Cuello */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.12. ÁNGULO MENTÓN-CUELLO:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Normal', 'Abierto', 'Cerrado'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s2_angulo_menton_cuello')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 2.13 Patron Facial */}
                                                                                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">2.13. PATRÓN FACIAL:</label>
                                                                                                    <div className="space-y-4">
                                                                                                        {/* Patron I */}
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="radio" value="Patron I" {...register('s2_patron_facial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-xs font-bold uppercase">Patrón I</span>
                                                                                                        </label>

                                                                                                        {/* Patron II */}
                                                                                                        <div className="space-y-2 px-4 py-3 bg-slate-50 rounded-lg">
                                                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value="Patron II" {...register('s2_patron_facial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">Patrón II</span>
                                                                                                            </label>
                                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                                                                                                                {[
                                                                                                                    { label: 'Retrusión Mandibular', name: 's2_patron_ii_retrusion_mand' },
                                                                                                                    { label: 'Protrusión Maxilar', name: 's2_patron_ii_protrusion_max' },
                                                                                                                    { label: 'Con aumento de AFAI', name: 's2_patron_ii_aumento_afai' },
                                                                                                                    { label: 'Con AFAI disminuida', name: 's2_patron_ii_disminuida_afai' }
                                                                                                                ].map((item) => (
                                                                                                                    <label key={item.name} className="flex items-center gap-2 cursor-pointer">
                                                                                                                        <input type="checkbox" {...register(item.name)} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                                        <span className="text-[10px] font-bold uppercase">{item.label}</span>
                                                                                                                    </label>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        {/* Patron III */}
                                                                                                        <div className="space-y-2 px-4 py-3 bg-slate-50 rounded-lg">
                                                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value="Patron III" {...register('s2_patron_facial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">Patrón III</span>
                                                                                                            </label>
                                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                                                                                                                {[
                                                                                                                    { label: 'Protrusión Mandibular', name: 's2_patron_iii_protrusion_mand' },
                                                                                                                    { label: 'Retrusión Maxilar', name: 's2_patron_iii_retrusion_max' },
                                                                                                                    { label: 'Con aumento de AFAI', name: 's2_patron_iii_aumento_afai' },
                                                                                                                    { label: 'Con AFAI disminuida', name: 's2_patron_iii_disminuida_afai' }
                                                                                                                ].map((item) => (
                                                                                                                    <label key={item.name} className="flex items-center gap-2 cursor-pointer">
                                                                                                                        <input type="checkbox" {...register(item.name)} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                                        <span className="text-[10px] font-bold uppercase">{item.label}</span>
                                                                                                                    </label>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        {/* Cara Corta & Cara Larga */}
                                                                                                        <div className="space-y-2">
                                                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value="Cara Corta" {...register('s2_patron_facial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">Cara Corta</span>
                                                                                                            </label>
                                                                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value="Cara Larga" {...register('s2_patron_facial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">Cara Larga</span>
                                                                                                            </label>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 3 && (
                                                                                            <div className="space-y-6">
                                                                                                {/* 3.1 Oclusion Manipulacion */}
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.1. OCLUSIÓN EM MANIPULACIÓN DE LA MANDÍBULA</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['RC = MIH', 'RC != MIH'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s3_oclusion_manipulacion')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <p className="text-[8px] text-slate-400 italic pl-2">*Relación Céntrica (RC); Máxima Intercuspidación Habitual (MIH)</p>
                                                                                                </div>

                                                                                                {/* TRANSVERSAL Header */}
                                                                                                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                                                                                                    <p className="text-[9px] font-bold text-slate-600 uppercase">TRANSVERSAL</p>
                                                                                                </div>

                                                                                                {/* 3.2 Relacion Transversal */}
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.2. RELACIÓN DENTAL TRANSVERSAL:</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        {['Brodie', 'Normal', 'Mordida cruzada posterior bilateral', 'Mordida cruzada posterior unilateral lado'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s3_relacion_transversal')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 px-4 py-2 bg-slate-50 rounded-lg">
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s3_transversal_derecho')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Derecho</span>
                                                                                                        </label>
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s3_transversal_izquierdo')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Izquierdo</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 3.3 Caracteristica Mordida */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.3. CARACTERÍSTICA DE LA MORDIDA CRUZADA:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Esqueletal', 'Dento-alveolar', 'No presenta'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s3_caracteristica_mordida')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* VERTICAL Header */}
                                                                                                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                                                                                                    <p className="text-[9px] font-bold text-slate-600 uppercase">VERTICAL</p>
                                                                                                </div>

                                                                                                {/* 3.4 Relacion Vertical */}
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.4. RELACIÓN DENTAL VERTICAL:</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        {['Normal', 'Bis a bis/borde a borde', 'Mordida profunda de', 'Mordida abierta de'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s3_relacion_vertical')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="mt-3 space-y-1">
                                                                                                        <label className="text-[9px] text-slate-400 italic">En milímetros:</label>
                                                                                                        <input {...register('s3_vertical_milimetros')} placeholder="Valor en mm..." className="w-full max-w-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs" />
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 3.5 Curva de Spee */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.5. CURVA DE SPEE:</label>
                                                                                                    <div className="space-y-2">
                                                                                                        {['Normal', 'Alterada'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s3_curva_spee')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                                                                                                        {[
                                                                                                            { label: 'Alterada por extrusión de incisivos inferiores', name: 's3_curva_alt_extrusion_inf' },
                                                                                                            { label: 'Alterada por extrusión de incisivos superiores', name: 's3_curva_alt_extrusion_sup' },
                                                                                                            { label: 'Alterada por intrusión de incisivos', name: 's3_curva_alt_intrusion' },
                                                                                                            { label: 'Alterada por molares extruidos', name: 's3_curva_alt_molares_extruidos' },
                                                                                                            { label: 'Alterada por molares instruidos', name: 's3_curva_alt_molares_instruidos' }
                                                                                                        ].map((item) => (
                                                                                                            <label key={item.name} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="checkbox" {...register(item.name)} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-[10px] font-bold uppercase">{item.label}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* SAGITAL Header */}
                                                                                                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                                                                                                    <p className="text-[9px] font-bold text-slate-600 uppercase">SAGITAL</p>
                                                                                                </div>

                                                                                                {/* 3.6 Relacion Sagital */}
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.6. RELACIÓN SAGITAL DE INCISIVOS:</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        {['Normal', 'Overjet aumentado de', 'Mordida cruzada anterior de'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s3_relacion_sagital')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <div className="mt-3 space-y-1">
                                                                                                        <label className="text-[9px] text-slate-400 italic">En milímetros:</label>
                                                                                                        <input {...register('s3_sagital_milimetros')} placeholder="Valor en mm..." className="w-full max-w-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs" />
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* RELACION SAGITAL EN MIH Header */}
                                                                                                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                                                                                                    <p className="text-[9px] font-bold text-slate-600 uppercase">RELACIÓN SAGITAL EN MIH</p>
                                                                                                </div>

                                                                                                {/* 3.7 Relacion Caninos MIH */}
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.7. RELACIÓN DE CANINOS (MIH):</label>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                        {/* Lado Derecho */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Derecho</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_caninos_mih_derecho')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>

                                                                                                        {/* Lado Izquierdo */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Izquierdo</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_caninos_mih_izquierdo')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 3.8 Relacion Molares */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.8. RELACIÓN DE MOLARES:</label>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                        {/* Lado Derecho */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Derecho</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_molares_derecho')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>

                                                                                                        {/* Lado Izquierdo */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Izquierdo</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_molares_izquierdo')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* RELACION EN RC Header */}
                                                                                                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                                                                                                    <p className="text-[9px] font-bold text-slate-600 uppercase">RELACIÓN EN RC</p>
                                                                                                    <p className="text-[8px] text-slate-500 italic">* Solo contestar si MIH es ≠ de RC</p>
                                                                                                </div>

                                                                                                {/* 3.9 Relacion Caninos RC */}
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.9 RELACIÓN DE CANINOS (RC):</label>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                        {/* Lado Derecho */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Derecho</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_caninos_rc_derecho')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>

                                                                                                        {/* Lado Izquierdo */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Izquierdo</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_caninos_rc_izquierdo')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 3 && (
                                                                                            <>
                                                                                                {/* 3.10 Relacion Molares (adicional MIH) */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.10. RELACIÓN DE MOLARES:</label>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                                        {/* Lado Derecho */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Derecho</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_molares_mih_derecho')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>

                                                                                                        {/* Lado Izquierdo */}
                                                                                                        <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                                                                                                            <p className="text-[9px] font-bold text-slate-600 uppercase mb-2">Lado Izquierdo</p>
                                                                                                            {['Clase I', '1/4 Clase II', '1/2 Clase II', '3/4 Clase II', 'Clase II completa', '1/4 Clase III', '1/2 Clase III', '3/4 Clase III', 'Clase III completa'].map((opt) => (
                                                                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                    <input type="radio" value={opt} {...register('s3_molares_mih_izquierdo')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                    <span className="text-[10px] font-bold uppercase">{opt}</span>
                                                                                                                </label>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </>
                                                                                        )}

                                                                                        {section.id === 3 && (
                                                                                            <>

                                                                                                {/* 3.11 Linea Media */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.11 LÍNEA MEDIA:</label>
                                                                                                    <div className="space-y-2">
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="radio" value="Coincidentes" {...register('s3_linea_media')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-xs font-bold uppercase">Coincidentes</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s3_linea_media_superior_desviada')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Línea media superior desviada</span>
                                                                                                        </label>
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="checkbox" {...register('s3_linea_media_inferior_desviada')} className="rounded text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-[10px] font-bold uppercase">Línea media inferior desviada</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                    <div className="mt-3 space-y-1">
                                                                                                        <label className="text-[9px] text-slate-400 italic">En milímetros:</label>
                                                                                                        <input {...register('s3_linea_media_milimetros')} placeholder="Valor en mm..." className="w-full max-w-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs" />
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* EXTRA Header */}
                                                                                                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                                                                                                    <p className="text-[9px] font-bold text-slate-600 uppercase">EXTRA</p>
                                                                                                </div>

                                                                                                {/* 3.12 Anomalias Dentales */}
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.12 Anomalías Dentales (forma/color/número):</label>
                                                                                                    <textarea {...register('s3_anomalias_dentales')} rows="3" placeholder="Describa las anomalías dentales..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                                </div>

                                                                                                {/* 3.13 Condicion ATM */}
                                                                                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.13 Condición de la ATM:</label>
                                                                                                    <textarea {...register('s3_condicion_atm')} rows="3" placeholder="Describa la condición de la ATM..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                                </div>

                                                                                                {/* 3.14 Familiar Maloclusion */}
                                                                                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">3.14 ¿Hay algún familiar con la misma maloclusión? Si es así, ¿quién?</label>
                                                                                                    <textarea {...register('s3_familiar_maloclusion')} rows="2" placeholder="Respuesta..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                        {section.id === 4 && (
                                                                                            <div className="space-y-6">
                                                                                                {/* 4.1 Alteraciones bases apicales */}
                                                                                                <div className="space-y-2">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">4.1 Alteraciones cefalometricas de las bases apicales.</label>
                                                                                                    <textarea
                                                                                                        {...register('s4_bases_apicales')}
                                                                                                        rows="4"
                                                                                                        placeholder="Ejemplo: SNA, SNB, ANB..."
                                                                                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"
                                                                                                    ></textarea>
                                                                                                    <p className="text-[9px] text-slate-400 italic">Rellenar esa sesión con datos cefalométricos que salen de la normalidad, referente a posición maxilo mandibular. Si los valores son normales no llenar esa sección.</p>
                                                                                                </div>

                                                                                                {/* 4.2 Alteraciones tendencia crecimiento */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">4.2 Alteraciones cefalometricas en relación a la tendencia de crecimiento.</label>
                                                                                                    <textarea
                                                                                                        {...register('s4_tendencia_crecimiento')}
                                                                                                        rows="4"
                                                                                                        placeholder="Ejemplo: FMA, SnGn..."
                                                                                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"
                                                                                                    ></textarea>
                                                                                                    <p className="text-[9px] text-slate-400 italic">Rellenar esa sesión con datos cefalométricos que salen de la normalidad, referente a tendencia de crecimiento. Si los valores son normales no llenar esa sección.</p>
                                                                                                </div>

                                                                                                {/* 4.3 Alteraciones aspectos dento-alveolares */}
                                                                                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">4.3 Alteraciones cefalométricas en relación a los aspectos dento-alveolares.</label>
                                                                                                    <textarea
                                                                                                        {...register('s4_aspectos_dentoalveolares')}
                                                                                                        rows="4"
                                                                                                        placeholder="Ejemplo: 1.NA, 1-NA, 1.NB, 1-NB..."
                                                                                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"
                                                                                                    ></textarea>
                                                                                                    <p className="text-[9px] text-slate-400 italic">Rellenar esta sesión con datos cefalométricos que salen de la normalidad, referente a la posición de incisivos. Si los valores son normales no llenar esa sección.</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        {section.id === 5 && (
                                                                                            <div className="space-y-6">
                                                                                                {/* 5.1 Tipo de respiracion */}
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">5.1 TIPO DE LA RESPIRACIÓN:</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Oral', 'Nasal', 'Oronasal'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s5_tipo_respiracion')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 5.2 Frenillo labial */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">5.2 FRENILLO LABIAL</label>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Normal', 'Muy inserido'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s5_frenillo_labial')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                    <p className="text-[9px] text-slate-400 font-bold italic">* Examen de la isquemia</p>
                                                                                                </div>

                                                                                                {/* 5.3 Ronca */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">5.3 ¿EL NIÑO RONCA DURANTE EL SUEÑO?</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="radio" value="Sí" {...register('s5_ronca')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-xs font-bold uppercase">Sí (Llenar el formulário de apnea)</span>
                                                                                                        </label>
                                                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                                                            <input type="radio" value="No" {...register('s5_ronca')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                            <span className="text-xs font-bold uppercase">No</span>
                                                                                                        </label>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 5.4 Prueba de habla */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <div className="space-y-1">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase italic">5.4 PRUEBA DE HABLA:</label>
                                                                                                        <p className="text-[9px] text-slate-400 font-bold uppercase italic pl-2">SESSENTA Y SEIS, ARENA, ARAÑA, RANA</p>
                                                                                                    </div>
                                                                                                    <div className="flex flex-wrap gap-6 items-center">
                                                                                                        {['Habla normal', 'Habla imprecisa'].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s5_prueba_habla')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* 5.5 Bruxismo */}
                                                                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">5.5 ¿HAY SEÑALES DE DESGASTES DENTALES POR BRUXISMO?</label>
                                                                                                    <div className="flex flex-col gap-3">
                                                                                                        {[
                                                                                                            'No hay desgastes',
                                                                                                            'Desgastes en piezas temporales',
                                                                                                            'Desgastes en piezas temporales y permanentes'
                                                                                                        ].map((opt) => (
                                                                                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                                                                <input type="radio" value={opt} {...register('s5_desgastes_bruxismo')} className="text-purple-600 focus:ring-purple-500" />
                                                                                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                                                                                            </label>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        {section.id === 6 && (
                                                                                            <div className="space-y-3">
                                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase italic">6. LISTA DE PROBLEMAS:</label>
                                                                                                <textarea {...register('s6_lista_problemas')} rows="6" placeholder="Describa la lista de problemas..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 7 && (
                                                                                            <div className="space-y-3">
                                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase italic">7. METAS DEL TRATAMIENTO:</label>
                                                                                                <textarea {...register('s7_metas_tratamiento')} rows="6" placeholder="Describa las metas del tratamiento..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 8 && (
                                                                                            <div className="space-y-3">
                                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase italic">8. SECUENCIA DEL TRATAMIENTO:</label>
                                                                                                <textarea {...register('s8_secuencia_tratamiento')} rows="6" placeholder="Describa la secuencia del tratamiento..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 9 && (
                                                                                            <div className="space-y-3">
                                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase italic">9. POSIBLES PRÓXIMAS ETAPAS:</label>
                                                                                                <textarea {...register('s9_proximas_etapas')} rows="6" placeholder="Describa las posibles próximas etapas..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs"></textarea>
                                                                                            </div>
                                                                                        )}

                                                                                        {section.id === 10 && (
                                                                                            <div className="space-y-6">
                                                                                                <div className="space-y-3">
                                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">10. PLAN DE TRATAMIENTO FINAL:</label>
                                                                                                    <textarea {...register('s13_plan_tratamiento_final')} rows="8" placeholder="Escriba el plan de tratamiento final..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs shadow-inner"></textarea>
                                                                                                </div>

                                                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                                                                                                    <div className="space-y-2">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">FECHA:</label>
                                                                                                        <input type="date" {...register('s13_fecha')} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                    </div>
                                                                                                    <div className="space-y-2">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">FIRMA DEL PACIENTE:</label>
                                                                                                        <input {...register('s13_firma_paciente')} placeholder="Nombre o firma digital..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold italic" />
                                                                                                    </div>
                                                                                                    <div className="space-y-2">
                                                                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">FIRMA DEL DOCTOR (A):</label>
                                                                                                        <input {...register('s13_firma_doctor')} placeholder="Nombre del profesional..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Main Accordion 2: Justificación */}
                                                            <div ref={acc2Ref} className={`rounded-xl border-2 transition-all ${mainAccordion === 2 ? 'border-purple-500 bg-purple-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const isOpen = mainAccordion === 2;
                                                                        setMainAccordion(isOpen ? null : 2);
                                                                        if (!isOpen) scrollToRef(acc2Ref);
                                                                    }}
                                                                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg ${mainAccordion === 2 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                            <ShieldCheckIcon className="h-5 w-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.2</p>
                                                                            <h3 className={`text-sm font-black uppercase ${mainAccordion === 2 ? 'text-purple-700' : 'text-slate-700'}`}>2. Justificación</h3>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 2 ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {mainAccordion === 2 && (
                                                                    <div className="px-5 pb-5 space-y-6 pt-2">
                                                                        {/* Intro Paragraph */}
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase italic">JUSTIFICACIÓN DEL TRATAMIENTO (PÁRRAFO INTRO):</label>
                                                                            <textarea
                                                                                {...register('s14_justificacion_texto')}
                                                                                rows="4"
                                                                                placeholder="Describa la situación actual del paciente..."
                                                                                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-xs shadow-sm font-bold"
                                                                            />
                                                                        </div>

                                                                        {/* Phase 1 Table Dynamic Inputs */}
                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center justify-between border-b border-purple-100 pb-1">
                                                                                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-wider">FASE 1: TRATAMIENTO DE ORTOPEDIA</h4>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => f1Append({ categoria: '', tratamiento_detalle: '', objetivo: '' })}
                                                                                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-[9px] font-bold rounded hover:bg-purple-700 transition-colors"
                                                                                >
                                                                                    <PlusIcon className="h-3 w-3" />
                                                                                    AGREGAR FILA
                                                                                </button>
                                                                            </div>

                                                                            <div className="space-y-4">
                                                                                {f1Fields.map((field, index) => (
                                                                                    <div key={field.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative group/row">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => f1Remove(index)}
                                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity shadow-sm"
                                                                                        >
                                                                                            <XMarkIcon className="h-3 w-3" />
                                                                                        </button>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                                            <div className="space-y-1">
                                                                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Categoría (Ej: Maxilar)</label>
                                                                                                <input {...register(`s14_f1_filas.${index}.categoria`)} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                            </div>
                                                                                            <div className="md:col-span-2 space-y-1">
                                                                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Tratamiento y Detalle</label>
                                                                                                <textarea {...register(`s14_f1_filas.${index}.tratamiento_detalle`)} rows="2" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" placeholder="Escriba el tratamiento y sus detalles..." />
                                                                                            </div>
                                                                                            <div className="space-y-1">
                                                                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Objetivo</label>
                                                                                                <textarea {...register(`s14_f1_filas.${index}.objetivo`)} rows="2" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>

                                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                                                                                <div className="md:col-span-3 space-y-1">
                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">DETALLES DE PRESUPUESTO (CUOTAS, ENTRADA, TIEMPO):</label>
                                                                                    <textarea {...register('s14_f1_ppto_detalle')} rows="3" className="w-full p-3 border border-slate-200 rounded-lg text-xs font-bold" placeholder="Ej: Valor total 800, entrada 150, 13 meses de 50..." />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase italic">VALOR TOTAL FASE 1:</label>
                                                                                    <input {...register('s14_f1_total')} type="text" className="w-full p-3 border border-slate-200 rounded-lg text-xs font-extrabold text-purple-700 bg-purple-50" placeholder="800.00" />
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Phase 2 Table Dynamic Inputs */}
                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center justify-between border-b border-purple-100 pb-1">
                                                                                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-wider">FASE 2: TRATAMIENTO DE ORTODONCIA</h4>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => f2Append({ categoria: '', tratamiento_detalle: '' })}
                                                                                    className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-white text-[9px] font-bold rounded hover:bg-slate-700 transition-colors"
                                                                                >
                                                                                    <PlusIcon className="h-3 w-3" />
                                                                                    AGREGAR FILA
                                                                                </button>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                {f2Fields.map((field, index) => (
                                                                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 relative group/row2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => f2Remove(index)}
                                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/row2:opacity-100 transition-opacity shadow-sm"
                                                                                        >
                                                                                            <XMarkIcon className="h-3 w-3" />
                                                                                        </button>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Categoría</label>
                                                                                            <input {...register(`s14_f2_filas.${index}.categoria`)} type="text" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" placeholder="Ej: Bimaxilar" />
                                                                                        </div>
                                                                                        <div className="md:col-span-2 space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Tratamiento y Detalle</label>
                                                                                            <textarea {...register(`s14_f2_filas.${index}.tratamiento_detalle`)} rows="2" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" placeholder="Escriba el tratamiento y sus detalles..." />
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Image Selection Section */}
                                                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                                                            <div className="flex justify-between items-center">
                                                                                <label className="text-[10px] font-bold text-slate-500 uppercase italic">
                                                                                    ANÁLISIS CLÍNICO - RADIOGRÁFICO (MÁX. 3 IMÁGENES):
                                                                                </label>
                                                                                <div className="flex items-center gap-2">
                                                                                    {(watch('s14_justificacion_imagenes') || []).length > 0 && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setValue('s14_justificacion_imagenes', [])}
                                                                                            className="text-[9px] font-bold text-red-500 hover:text-red-700 underline uppercase"
                                                                                        >
                                                                                            Limpiar selección
                                                                                        </button>
                                                                                    )}
                                                                                    <span className="text-[9px] font-bold text-slate-400">
                                                                                        Seleccionadas: {(watch('s14_justificacion_imagenes') || []).length} / 3
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Hidden input to register array */}
                                                                            <input type="hidden" {...register('s14_justificacion_imagenes')} />

                                                                            {/* Pool of all available images (current + history) */}
                                                                            {(() => {
                                                                                const currentImages = watch('imagenes')?.flatMap(group => group.data || []) || [];
                                                                                const allAvailable = [...currentImages, ...patientHistoryImages]
                                                                                    .filter((img, index, self) => self.indexOf(img) === index);

                                                                                if (allAvailable.length === 0) {
                                                                                    return (
                                                                                        <div className="p-4 bg-slate-50 rounded-lg text-center border-2 border-dashed border-slate-200">
                                                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">No hay imágenes en la galería del paciente</p>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setIsGalleryOpen(true)}
                                                                                                className="mt-2 text-xs text-purple-600 font-bold hover:underline"
                                                                                            >
                                                                                                Subir imágenes ahora
                                                                                            </button>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                return (
                                                                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                                                        {allAvailable.map((img, idx) => {
                                                                                            const selectedImages = watch('s14_justificacion_imagenes') || [];
                                                                                            const isSelected = selectedImages.includes(img);

                                                                                            return (
                                                                                                <div
                                                                                                    key={idx}
                                                                                                    onClick={() => {
                                                                                                        if (isSelected) {
                                                                                                            setValue('s14_justificacion_imagenes', selectedImages.filter(i => i !== img));
                                                                                                        } else {
                                                                                                            if (selectedImages.length < 3) {
                                                                                                                setValue('s14_justificacion_imagenes', [...selectedImages, img]);
                                                                                                            }
                                                                                                        }
                                                                                                    }}
                                                                                                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-purple-600 ring-2 ring-purple-200' : 'border-slate-200 hover:border-purple-300'}`}
                                                                                                >
                                                                                                    <img src={img} className="w-full h-full object-cover" alt="Selector" />
                                                                                                    {isSelected && (
                                                                                                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                                                                                                            <div className="bg-purple-600 text-white rounded-full p-1">
                                                                                                                <ClipboardDocumentCheckIcon className="h-3 w-3" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>

                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Main Accordion 3: Presupuesto Ortopedia Personalizado */}
                                                            <div ref={acc3Ref} className={`rounded-xl border-2 transition-all ${mainAccordion === 3 ? 'border-purple-500 bg-purple-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const isOpen = mainAccordion === 3;
                                                                        setMainAccordion(isOpen ? null : 3);
                                                                        if (!isOpen) scrollToRef(acc3Ref);
                                                                    }}
                                                                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg ${mainAccordion === 3 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                            <ListBulletIcon className="h-5 w-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.3</p>
                                                                            <h3 className={`text-sm font-black uppercase ${mainAccordion === 3 ? 'text-purple-700' : 'text-slate-700'}`}>3. Presupuesto Ortopedia Personalizado</h3>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 3 ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {mainAccordion === 3 && (
                                                                    <div className="px-5 pb-5 space-y-6 pt-2">
                                                                        <div className="space-y-4">
                                                                            <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-wider border-b border-purple-100 pb-1">TABLA DE PRESUPUESTO</h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Tratamiento</label>
                                                                                    <textarea {...register('s15_ppto_tratamiento')} rows="3" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Aparato Ortopédico</label>
                                                                                    <textarea {...register('s15_ppto_aparato')} rows="3" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Abono</label>
                                                                                    <input {...register('s15_ppto_abono')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Total</label>
                                                                                    <input {...register('s15_ppto_total')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className="text-[9px] font-bold text-slate-400 uppercase">Nota</label>
                                                                                <textarea {...register('s15_ppto_nota')} rows="2" className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2 pt-4 border-t border-slate-100">
                                                                            <label className="text-[10px] font-bold text-slate-500 uppercase italic">JUSTIFICACIÓN PERSONALIZADA (PARA ESTE PACIENTE):</label>
                                                                            <textarea
                                                                                {...register('s15_indicaciones_paciente')}
                                                                                rows="6"
                                                                                placeholder="Escriba la justificación personalizada..."
                                                                                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none font-bold text-xs shadow-inner"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Main Accordion 4: Registro de pago por tratamiento Ortodoncia */}
                                                            <div ref={acc4Ref} className={`rounded-xl border-2 transition-all ${mainAccordion === 4 ? 'border-purple-500 bg-purple-50/10 shadow-lg' : 'border-slate-200 bg-white'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const isOpen = mainAccordion === 4;
                                                                        setMainAccordion(isOpen ? null : 4);
                                                                        if (!isOpen) scrollToRef(acc4Ref);
                                                                    }}
                                                                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg ${mainAccordion === 4 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                            <ShieldCheckIcon className="h-5 w-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paso 2.4</p>
                                                                            <h3 className={`text-sm font-black uppercase ${mainAccordion === 4 ? 'text-purple-700' : 'text-slate-700'}`}>4. Registro de pago por tratamiento Ortopedia</h3>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${mainAccordion === 4 ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {mainAccordion === 4 && (
                                                                    <div className="px-5 pb-5 space-y-4 pt-2">
                                                                        {/* Sub-Accordion 1 */}
                                                                        <div ref={subAcc1Ref} className={`rounded-lg border transition-all ${subAccordion === 1 ? 'border-purple-400 bg-purple-50/20' : 'border-slate-200 bg-white'}`}>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const isOpen = subAccordion === 1;
                                                                                    setSubAccordion(isOpen ? null : 1);
                                                                                    if (!isOpen) scrollToRef(subAcc1Ref);
                                                                                }}
                                                                                className="flex w-full items-center justify-between px-4 py-3 text-left"
                                                                            >
                                                                                <span className="text-xs font-bold text-slate-700 uppercase">1. Contrato de Ortopedia (PDF 1)</span>
                                                                                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${subAccordion === 1 ? 'rotate-180' : ''}`} />
                                                                            </button>
                                                                            {subAccordion === 1 && (
                                                                                <div className="px-4 pb-4 space-y-4 pt-2 border-t border-slate-100">
                                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Fecha</label>
                                                                                            <input type="date" {...register('s16_ppto_fecha')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Valor Total $</label>
                                                                                            <input {...register('s16_ppto_total_tratamiento')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Tiempo Estimado</label>
                                                                                            <input {...register('s16_ppto_tiempo_estimado')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Cuota Mensual $</label>
                                                                                            <input {...register('s16_ppto_cuota_mensual')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="overflow-x-auto border rounded-lg border-slate-200">
                                                                                        <table className="w-full text-[10px]">
                                                                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                                                                <tr>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase w-8">#</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase">Fecha</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase">Mes Control</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase w-20">Valor</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase">Forma Pago</th>
                                                                                                    <th className="px-2 py-2 text-center w-10"></th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="divide-y divide-slate-100">
                                                                                                {pptoPagosFields.map((field, index) => (
                                                                                                    <tr key={field.id} className="hover:bg-slate-50/50">
                                                                                                        <td className="px-2 py-1 font-bold text-slate-400">{index + 1}</td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input type="date" {...register(`s16_ppto_pagos_filas.${index}.fecha`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input {...register(`s16_ppto_pagos_filas.${index}.mes`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input {...register(`s16_ppto_pagos_filas.${index}.valor`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input {...register(`s16_ppto_pagos_filas.${index}.forma_pago`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1 text-center">
                                                                                                            <button type="button" onClick={() => pptoPagosRemove(index)} className="text-red-400 hover:text-red-600">
                                                                                                                <TrashIcon className="h-3 w-3" />
                                                                                                            </button>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                ))}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => pptoPagosAppend({ fecha: '', mes: '', valor: '', forma_pago: '' })}
                                                                                        className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase flex items-center gap-1"
                                                                                    >
                                                                                        <PlusIcon className="h-3 w-3" /> Añadir Fila de Pago
                                                                                    </button>

                                                                                    <div className="space-y-1 pt-2">
                                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Aparato Ortopédico (Footer PDF)</label>
                                                                                        <input {...register('s16_ppto_aparato_footer')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" placeholder="Especifique el aparato..." />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Sub-Accordion 2 */}
                                                                        <div ref={subAcc2Ref} className={`rounded-lg border transition-all ${subAccordion === 2 ? 'border-purple-400 bg-purple-50/20' : 'border-slate-200 bg-white'}`}>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const isOpen = subAccordion === 2;
                                                                                    setSubAccordion(isOpen ? null : 2);
                                                                                    if (!isOpen) scrollToRef(subAcc2Ref);
                                                                                }}
                                                                                className="flex w-full items-center justify-between px-4 py-3 text-left"
                                                                            >
                                                                                <span className="text-xs font-bold text-slate-700 uppercase">2. Registro de Procedimiento (PDF 2)</span>
                                                                                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${subAccordion === 2 ? 'rotate-180' : ''}`} />
                                                                            </button>
                                                                            {subAccordion === 2 && (
                                                                                <div className="px-4 pb-4 space-y-4 pt-2 border-t border-slate-100">
                                                                                    {/* ... content truncated for brevity in replacement ... */}
                                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Fecha</label>
                                                                                            <input type="date" {...register('s16_proc_fecha')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                        <div className="space-y-1 col-span-2">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Aparatos Ortopédicos</label>
                                                                                            <input {...register('s16_proc_aparatos')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" placeholder="Especifique aparatos..." />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="grid grid-cols-3 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Unmaxilar</label>
                                                                                            <input {...register('s16_proc_unmaxilar')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Bimaxilar</label>
                                                                                            <input {...register('s16_proc_bimaxilar')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Auxiliares</label>
                                                                                            <input {...register('s16_proc_auxiliares')} className="w-full p-2 border border-slate-200 rounded text-xs font-bold" />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-1">
                                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Hallazgos Relevantes</label>
                                                                                        <textarea {...register('s16_proc_hallazgos')} rows="2" className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold resize-none" placeholder="Hallazgos..." />
                                                                                    </div>

                                                                                    <div className="overflow-x-auto border rounded-lg border-slate-200">
                                                                                        <table className="w-full text-[10px]">
                                                                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                                                                <tr>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase w-8">#</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase w-32">Fecha</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase w-40">Mes Control</th>
                                                                                                    <th className="px-2 py-2 text-left font-black text-slate-500 uppercase">Observaciones</th>
                                                                                                    <th className="px-2 py-2 text-center w-10"></th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="divide-y divide-slate-100">
                                                                                                {procFilasFields.map((field, index) => (
                                                                                                    <tr key={field.id} className="hover:bg-slate-50/50">
                                                                                                        <td className="px-2 py-1 font-bold text-slate-400">{index + 1}</td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input type="date" {...register(`s16_proc_filas.${index}.fecha`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input {...register(`s16_proc_filas.${index}.mes`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1">
                                                                                                            <input {...register(`s16_proc_filas.${index}.observaciones`)} className="w-full p-1 border-b border-transparent focus:border-purple-300 outline-none bg-transparent font-bold" />
                                                                                                        </td>
                                                                                                        <td className="px-2 py-1 text-center">
                                                                                                            <button type="button" onClick={() => procFilasRemove(index)} className="text-red-400 hover:text-red-600">
                                                                                                                <TrashIcon className="h-3 w-3" />
                                                                                                            </button>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                ))}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => procFilasAppend({ fecha: '', mes: '', observaciones: '' })}
                                                                                        className="text-[10px] font-black text-purple-600 hover:text-purple-700 uppercase flex items-center gap-1"
                                                                                    >
                                                                                        <PlusIcon className="h-3 w-3" /> Añadir Fila de Control
                                                                                    </button>

                                                                                    <div className="space-y-1 pt-2">
                                                                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Objetivos (Footer PDF)</label>
                                                                                        <textarea {...register('s16_proc_objetivos')} rows="2" className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold resize-none" placeholder="Especifique los objetivos..." />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (!recordId) {
                                                                            alert('Por favor, registra los datos del paciente (PASO 1) antes de subir imágenes para asegurar que se guarden correctamente.');
                                                                            return;
                                                                        }
                                                                        setIsGalleryOpen(true);
                                                                    }}
                                                                    className={`w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${!recordId ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-60 cursor-not-allowed' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-500 hover:text-purple-600'}`}
                                                                >
                                                                    <PlusIcon className="h-6 w-6" />
                                                                    <span className="text-sm font-medium">
                                                                        {!recordId ? 'REGISTRA AL PACIENTE PARA SUBIR FOTOS' : `Galería de Imágenes Clínica (${((watch('imagenes')?.reduce((acc, curr) => acc + (curr.data?.length || 0), 0) || 0) + patientHistoryImages.length)} fotos)`}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Column - PDF Preview */}
                                                <div className="space-y-4">
                                                    {step === 2 && (
                                                        <>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-lg font-semibold text-gray-900">Vista Previa del PDF</h3>
                                                                <button
                                                                    type="button"
                                                                    onClick={refreshPDF}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-all shadow-md active:scale-95"
                                                                >
                                                                    <ArrowPathIcon className="h-4 w-4" />
                                                                    Actualizar Vista Previa
                                                                </button>
                                                            </div>
                                                            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative group">
                                                                <PDFViewer width="100%" height="600" className="rounded-lg border-2 border-purple-100 shadow-sm">
                                                                    <OrtopediaDocument
                                                                        data={pdfData}
                                                                        mode={pdfData.pdfMode || (mainAccordion === 4 ? (subAccordion === 1 ? 4 : (subAccordion === 2 ? 5 : 4)) : mainAccordion)}
                                                                    />
                                                                </PDFViewer>
                                                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-purple-100 flex items-center gap-2 transition-all">
                                                                    <div className={`h-2.5 w-2.5 rounded-full ${JSON.stringify(formData) === JSON.stringify(pdfData) ? 'bg-green-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                                                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                                                                        {JSON.stringify(formData) === JSON.stringify(pdfData) ? 'Vista Sincronizada' : 'Cambios pendientes...'}
                                                                    </span>
                                                                </div>


                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-6 flex flex-wrap gap-3 justify-end border-t pt-6">
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancelar
                                                </button>

                                                {Object.keys(pdfData).length > 0 && (
                                                    <PDFDownloadLink
                                                        document={<OrtopediaDocument data={pdfData} mode={pdfData.pdfMode || (mainAccordion === 4 ? (subAccordion === 1 ? 4 : (subAccordion === 2 ? 5 : 4)) : mainAccordion)} />}
                                                        fileName={`ficha_ortopedia_${Date.now()}.pdf`}
                                                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all"
                                                    >
                                                        {({ loading }) => (loading ? 'Preparando PDF...' : 'Descargar PDF')}
                                                    </PDFDownloadLink>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? 'Guardando...' : step === 1 ? 'Guardar y Continuar' : 'Guardar Ficha'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <ModalGalleryFicha
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={watch('imagenes') || []}
                historyImages={patientHistoryImages}
                onSave={(newImages) => setValue('imagenes', newImages, { shouldDirty: true })}
                recordId={recordId}
                fichaType="ortopedia"
            />
        </div>
    );
}
