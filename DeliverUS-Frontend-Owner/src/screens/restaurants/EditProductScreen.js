import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { getDetailProduct, update } from '../../api/ProductEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { Formik } from 'formik'
import TextError from '../../components/TextError'
import { prepareEntityImages } from '../../api/helpers/FileUploadHelper'
import { buildInitialValues } from '../Helper'
import productLogo from '../../../assets/product.jpeg'

export default function EditProductScreen ({ navigation, route }) {
  const [product, setProduct] = useState({})
  const [initialProductValues, setInitialProductValues] = useState({ name: null, description: null, price: null, heroImage: null })
  const [backendErrors, setBackendErrors] = useState()

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .max(255, 'Name too long')
      .required('Name is required'),
    description: yup
      .string()
      .max(255, 'Name too long')
      .required('Name is required'),
    price: yup
      .number()
      .positive()
      .integer()
  })

  useEffect(() => {
    async function fetchProductDetail () {
      try {
        const fetchedProduct = await getDetailProduct(route.params.id)
        const preparedProduct = prepareEntityImages(fetchedProduct, ['logo', 'heroImage'])
        setProduct(preparedProduct)
        const initialValues = buildInitialValues(preparedProduct, initialProductValues)
        setInitialProductValues(initialValues)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving product details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchProductDetail()
  }, [route])

  const pickImage = async (onSuccess) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }

  const updateProduct = async (values) => {
    setBackendErrors([])
    try {
      const updatedProduct = await update(product.id, values)
      showMessage({
        message: `Product ${updatedProduct.name} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantsDetailScreen', { dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <Formik
      validationSchema={validationSchema}
      enableReinitialize
      initialValues={initialProductValues}
      onSubmit={updateProduct}
    >
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='name'
                label='Name:'
              />
              <InputItem
                name='description'
                label='Description:'
              />
              <InputItem
                name='price'
                label='Price:'
              />

              <Pressable onPress={() =>
                pickImage(
                  async result => {
                    await setFieldValue('heroImage', result)
                  }
                )
              }
                style={styles.imagePicker}
              >
                <TextRegular>Hero image: </TextRegular>
                <Image style={styles.image} source={values.heroImage ? { uri: values.heroImage.assets[0].uri } : productLogo} />
              </Pressable>

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  }
})
