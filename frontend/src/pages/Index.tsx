import { FormProvider } from '@/context/FormContext';
import { FormWizard } from '@/components/zant/FormWizard';
import { Helmet } from 'react-helmet';

const Index = () => {
  return (
    <FormProvider>
      <Helmet>
        <title>ZANT - Asystent zgłoszenia wypadku przy pracy | ZUS</title>
        <meta
          name="description"
          content="ZANT (ZUS Accident Notification Tool) - narzędzie pomagające krok po kroku przygotować dokumenty do zgłoszenia wypadku przy pracy do ZUS."
        />
      </Helmet>
      <FormWizard />
    </FormProvider>
  );
};

export default Index;
