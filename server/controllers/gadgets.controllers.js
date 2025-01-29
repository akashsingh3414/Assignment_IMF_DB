import db from "../db/db.js"

export const getGadgets = async (req, res) => {

    const {status} = req.query
    const statuses = ['Available', 'Deployed', 'Destroyed', 'Decommissioned'];

    if (status && !statuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status sent", validStatus: statuses});
    }


    try {
        if(status) {
            const gadgets = await db.gadget.findMany({
                where: {
                    status: status
                }
            })
    
            gadgets.map((gadget)=>{
                gadget.mission_success_probability = Math.round(Math.random()*100)
            })
    
            return res.status(200).json({message: 'Gadgets fetched successfully', gadgets})
        }
    
        const gadgets = await db.gadget.findMany()
    
        gadgets.map((gadget)=>{
            gadget.mission_success_probability = Math.round(Math.random()*100)
        })
    
        return res.status(200).json({message: "All gadgets fetched successfully", gadgets})
    } catch (error) {
        return res.status(500).json({ message: "Error while getting gadgets", error: error.message });
    }
}

export const createGadget = async (req, res) => {
    const codenames = [
        "The Nightingale",
        "The Kraken",
        "The Falcon",
        "The Phoenix",
        "The Panther",
        "The Titan",
        "The Maverick",
        "The Shadow",
        "The Cyclops",
        "The Viper"
    ];

    const codename = codenames[Math.floor((Math.random() * 100) % codenames.length)];
        
    try {
        const gadget = await db.gadget.create({
            data: {
                name: codename,
                status: 'Available'
            }
        })
    return res.status(200).json({message: "Gadget Added", gadget})
    } catch (error) {
        return res.status(500).json({ message: "Error while creating gadget", error: error.message });
    }
}

export const updateGadget = async (req, res) => {
    const { name, status, id } = req.body;

    if(!id) {
        return res.status(400).json({ message: "Gadget ID is required to update gadget" });
    }

    if (!name && !status) {
        return res.status(400).json({ message: "At least one field (name or status) is required" });
    }

    const statuses = ['Available', 'Deployed', 'Destroyed', 'Decommissioned'];

    if (status && !statuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status sent", validStatus: statuses});
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (status) updateData.status = status;

    try {
        await db.gadget.update({
            where: { 
                id: id
             },
            data: updateData
        });

        return res.status(200).json({ message: "Gadget Updated" });
    } catch (error) {
        return res.status(500).json({ message: "Error while updating gadget", error: error.message });
    }
}

export const deleteGadget = async (req, res) => {
    const { id } = req.body;

    if(!id) {
        return res.status(400).json({ message: "Gadget ID is required to delete gadget" });
    }

    try {
        await db.gadget.update({
            where: {
                id: id
            },
            data: {
                decommissionedAt: new Date().toISOString(),
                status: "Decommissioned"
            }
        })
        return res.status(200).json({message: "Gadget deleted successfully"})
    } catch (error) {
        return res.status(500).json({ message: "Error while deleting gadget", error: error.message });
    }
}

export const selfDestructGadget = async (req, res) => {
    const { id } = req.params;
    const { confirmationCode } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Gadget ID is required" });
    }

    const generatedCode = Math.floor(1000 + Math.random() * 9000);

    try {

        const checkStatus = await db.gadget.findUnique({
            where: {
                id: id
            }
        })

        if(checkStatus.status === 'Destroyed') {
            return res.status(200).json({ 
                message: "Gadget already self-destructed", 
                gadget: checkStatus
            });
        }

        if (!confirmationCode) {
            return res.status(200).json({ 
                message: "Confirm self-destruction with this code", 
                confirmation_code: generatedCode 
            });
        }

        const gadget = await db.gadget.update({
            where: { id: id },
            data: {
                status: "Destroyed",
                destroyedAt: new Date().toISOString()
            }
        });

        return res.status(200).json({ message: "Gadget self-destructed successfully", gadget });
    } catch (error) {
        return res.status(500).json({ message: "Error while self-destructing gadget", error: error.message });
    }
};