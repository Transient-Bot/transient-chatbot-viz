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

    postSpecification(selectedService.id, cause, initialLoss, recoveryTime, resilienceLoss);

    $('#add-specification-modal').modal('hide');
}