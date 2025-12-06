import Form from './Form';
import FormActions from './FormActions';
import Modal from './Modal';

const FormDialog = ({ open, title, description, onClose, onSubmit, children, submitLabel }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={<FormActions onCancel={onClose} submitLabel={submitLabel} />}
  >
    {description ? <p className="mb-3 text-sm text-slate-600">{description}</p> : null}
    <Form onSubmit={onSubmit}>{children}</Form>
  </Modal>
);

export default FormDialog;
