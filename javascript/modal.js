function computeResilienceLoss() {
    const initialLoss = document.getElementById('initial-loss-input').value;
    const recoveryTime = document.getElementById('recovery-time-input').value;

    var resilience_loss = (initialLoss * recoveryTime) / 2;
    document.getElementById('resilience-loss-input').value = resilience_loss;
}

function addSpecification() {
    const initialLoss = document.getElementById('initial-loss-input').value;
    const recoveryTime = document.getElementById('recovery-time-input').value;
    const resilienceLoss = document.getElementById('resilience-loss-input').value;
    const cause = document.getElementById('causes').value;

    const actInd = document.getElementById('act-ind');
    const closeBarBtn = document.getElementById('close-modal-bar-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const addBtn = document.getElementById('add-specification-btn');

    actInd.style.display = 'inline';
    closeBarBtn.style.display = 'none';
    closeBtn.style.display = 'none';
    addBtn.style.display = 'none';

    postSpecification(selectedService.id, cause, initialLoss, recoveryTime, resilienceLoss)
        .then(res => {
            if (res != null) {
                actInd.style.display = 'none';
                closeBarBtn.style.display = 'flex';
                closeBtn.style.display = 'inline';
                addBtn.style.display = 'inline';
                $('#add-specification-modal').modal('hide');
    
                const callId = document.getElementById('endpoints').value;
                fetchServiceData(selectedService.id, callId)
                    .then(data => {
                        if (data != null) {
                            serviceData = data;
                            createDataGraph(serviceData)
                        }
                        handleSpecification(res);
                    })
            }
        })
}