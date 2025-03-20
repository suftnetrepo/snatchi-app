import React, {useState, useRef} from 'react';
import {
  YStack,
  XStack,
  StyledHeader,
  StyledSafeAreaView,
  StyledSpacer,
  StyledText,
  StyledBadge,
  StyledCard,
  StyledCycle,
  StyledSeparator,
  FlexStyledImage,
  StyledOkDialog,
  StyledButton,
  StyledInput,
} from 'fluent-styles';
import {theme} from '../../utils/theme';
import {fontStyles} from '../../utils/fontStyles';
import {
  Linking,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation, useRoute, CommonActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  backgroundColorHelper,
  formatTimeFromDate,
  priorityBackgroundColorHelper,
  priorityTextColorHelper,
  textColorHelper,
  taskStatusArray,
  timeAgo,
  randomColor,
} from '../../utils/help';
import {StyledMIcon} from '../../components/icon';
import TaskDropdown from '../../components/taskDropdown';
import {useTask} from '../../hooks/useTask';
import {Modalize} from 'react-native-modalize';
import {useTaskComments} from '../../hooks/useTaskComments';
import {validate} from '../../validator';
import {useAppContext} from '../../hooks/appContext';
import {Swipeable} from 'react-native-gesture-handler';
import MapScreen from '../../components/map';

const Task = () => {
  const {user} = useAppContext();
  const [visible, setVisible] = useState(true);
  const route = useRoute();
  const navigator = useNavigation();
  const [errorMessages, setErrorMessages] = useState({});
  const {handleEdit, handleReset, success, error} = useTask();
  const {task} = route.params;
  const {
    name,
    priority,
    status,
    startDate,
    endDate,
    description,
    attachments,
    project,
  } = task;
  const {
    comments,
    fields,
    rules,
    handleAddComment,
    handleCommentReset,
    handleDelete,
    handleChange,
  } = useTaskComments(task.project._id, task._id);
  const [taskStatus, setTaskStatus] = useState(status);
  const modalizeRef = useRef(null);

  const handleShow = async () => {
    if (modalizeRef.current) {
      modalizeRef.current.open();
    }
  };

  const handleClose = async () => {
    if (modalizeRef.current) {
      modalizeRef.current.close();
    }
  };

  const onDelete = async id => {
    handleDelete(id).then(() => {});
  };

  const onSubmit = async () => {
    setErrorMessages({});
    const validationResult = validate(fields, rules);

    if (validationResult.hasError) {
      setErrorMessages(validationResult.errors);
      return;
    }

    const body = {
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
      },
      text: fields.text,
      author: user.user_id,
      taskId: task._id,
      projectId: task.project._id,
    };

    handleAddComment(body).then(() => {
      handleCommentReset();
    });
  };

  const handleDeepLink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        if (__DEV__) console.error("Don't know how to open this URL: " + url);
      }
    } catch (error) {
      if (__DEV__)
        console.error('An error occurred while opening the URL: ', error);
    }
  };

  const FileIcon = ({fileType}) => {
    let icon;
    let color;
    switch (fileType.toLowerCase()) {
      case 'pdf':
        icon = 'file-pdf-o';
        color = '#FF0000';
        break;
      case 'word':
        icon = 'file-word-o';
        color = '#0000FF';
        break;
      case 'image':
        icon = 'image';
        color = '#00FF00';
        break;
      default:
        icon = 'file-o';
        color = '#000000';
    }

    return <FontAwesome name={icon} size={20} color={color} />;
  };

  const openGoogleSearch = () => {
    const encodedQuery = encodeURIComponent(`hotels near ${project?.postcode}`);
    const url = `https://www.google.com/search?q=${encodedQuery}`;
    Linking.openURL(url);
  };

  const openGoogleSearchNearByAirport = () => {
    const encodedQuery = encodeURIComponent(
      `airport near ${project?.postcode}`,
    );
    const url = `https://www.google.com/search?q=${encodedQuery}`;
    Linking.openURL(url);
  };

  const openGoogleMapsForTrainStations = () => {
    const encodedQuery = encodeURIComponent(
      `train stations near ${project?.postcode}`,
    );
    const url = `https://www.google.com/maps/search/?q=${encodedQuery}`;
    Linking.openURL(url);
  };

  const openGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(project?.postcode);
    let url;

    if (Platform.OS === 'android') {
      url = `geo:0,0?q=${encodedAddress}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log('Unable to open Google Maps.');
        }
      })
      .catch(err => console.error('Error opening URL:', err));
  };

  const RenderHeader = () => (
    <XStack
      paddingHorizontal={16}
      paddingVertical={8}
      justifyContent="flex-start"
      alignItems="center"
      backgroundColor={theme.colors.gray[50]}>
      <StyledCycle
        pressable
        pressableProps={{
          onPress: () =>
            navigator.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'bottom-tabs'}],
              }),
            ),
        }}
        height={48}
        width={48}
        borderColor={theme.colors.gray[200]}>
        <Icon name="arrow-back" size={15} color={theme.colors.gray[800]} />
      </StyledCycle>
      <StyledSpacer marginHorizontal={2} />
      <StyledText
        fontFamily={fontStyles.Roboto_Regular}
        fontWeight={theme.fontWeight.normal}
        color={theme.colors.gray[600]}
        fontSize={theme.fontSize.normal}>
        Tasks
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledCycle
        height={48}
        width={48}
        borderColor={theme.colors.cyan[500]}
        backgroundColor={theme.colors.cyan[500]}>
        <Icon
          name="file-upload"
          size={25}
          color={theme.colors.gray[1]}
          onPress={() =>
            navigator.navigate('task-document', {
              task_id: task._id,
              project_id: project._id,
            })
          }
        />
      </StyledCycle>
      <StyledSpacer marginHorizontal={8} />
    </XStack>
  );

  const RenderComment = ({item}) => (
    <YStack
      backgroundColor={theme.colors.gray[1]}
      borderColor={theme.colors.gray[800]}
      borderRadius={16}
      paddingVertical={8}
      marginBottom={8}
      justifyContent="flex-start"
      alignItems="start"
      paddingHorizontal={8}>
      <XStack justifyContent="flex-start" alignItems="center">
        <NameInitialCircle name={item?.author?.first_name} />
        <YStack
          justifyContent="flex-start"
          alignItems="start"
          paddingHorizontal={8}>
          <StyledText
            fontFamily={fontStyles.crimson_text_regular}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.normal}
            color={theme.colors.gray[800]}>
            {item?.author?.first_name} {item?.author?.last_name}
          </StyledText>
          <StyledText
            fontFamily={fontStyles.crimson_text_regular}
            fontWeight={theme.fontWeight.normal}
            fontSize={theme.fontSize.small}
            color={theme.colors.gray[400]}>
            {timeAgo(item.createdAt)}
          </StyledText>
        </YStack>
      </XStack>
      <XStack paddingHorizontal={4}>
        <StyledText
          fontFamily={fontStyles.crimson_text_regular}
          fontWeight={theme.fontWeight.normal}
          fontSize={theme.fontSize.normal}
          color={theme.colors.gray[700]}>
          {item.text}
        </StyledText>
      </XStack>
    </YStack>
  );

  const location = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const NameInitialCircle = ({name}) => {
    const initial = name ? name.charAt(0).toUpperCase() : 'A';
    const color = randomColor();
    return (
      <StyledCycle
        height={40}
        width={40}
        borderColor={color}
        backgroundColor={color}>
        <StyledText
          fontFamily={fontStyles.Roboto_Regular}
          fontWeight={theme.fontWeight.normal}
          fontSize={theme.fontSize.small}
          color={theme.colors.gray[50]}>
          {initial}
        </StyledText>
      </StyledCycle>
    );
  };

  const renderRightActions = (commentId, authorId) => {
    if (authorId !== user.user_id) return null;

    return (
      <Pressable onPress={() => onDelete(commentId)}>
        <YStack height="100%" justifyContent="center" alignItems="center">
          <StyledCycle
            height={48}
            width={48}
            borderColor={theme.colors.gray[200]}
            backgroundColor={theme.colors.gray[1]}>
            <Icon name="delete" size={24} color={theme.colors.gray[800]} />
          </StyledCycle>
        </YStack>
      </Pressable>
    );
  };

  return (
    <StyledSafeAreaView backgroundColor={theme.colors.gray[50]}>
      <StyledHeader
        skipAndroid={true}
        marginHorizontal={8}
        statusProps={{translucent: true}}>
        <StyledHeader.Full>
          <RenderHeader />
        </StyledHeader.Full>
      </StyledHeader>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StyledCard
          borderRadius={32}
          flex={1}
          borderColor={theme.colors.gray[50]}
          backgroundColor={theme.colors.gray[1]}
          paddingVertical={8}
          marginHorizontal={8}
          borderWidth={1}>
          <YStack paddingHorizontal={8} paddingVertical={8}>
            <XStack justifyContent="flex-start" alignItems="center" gap={1}>
              {visible ? (
                <>
                  <StyledBadge
                    paddingHorizontal={8}
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.medium}
                    fontSize={theme.fontSize.small}
                    backgroundColor={backgroundColorHelper(taskStatus)}
                    paddingVertical={4}
                    borderColor={backgroundColorHelper(taskStatus)}
                    color={textColorHelper(taskStatus)}>
                    {taskStatus}
                  </StyledBadge>
                  <StyledMIcon
                    name="create"
                    size={20}
                    color={theme.colors.gray[900]}
                    onPress={() => setVisible(false)}
                  />
                </>
              ) : (
                <TaskDropdown
                  visible={true}
                  selectedValue={taskStatus}
                  items={taskStatusArray}
                  onHide={() => setVisible(true)}
                  onSaveChanges={async value => {
                    setVisible(true);
                    setTaskStatus(value);
                    await handleEdit({status: value}, task._id);
                  }}></TaskDropdown>
              )}

              <StyledBadge
                paddingHorizontal={8}
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.small}
                backgroundColor={priorityBackgroundColorHelper(priority)}
                paddingVertical={4}
                borderColor={priorityBackgroundColorHelper(priority)}
                color={priorityTextColorHelper(priority)}>
                {priority}
              </StyledBadge>
            </XStack>
            <XStack
              paddingVertical={8}
              justifyContent="flex-start"
              alignItems="center"
              gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.medium}
                fontSize={theme.fontSize.normal}
                color={theme.colors.gray[800]}>
                {name}
              </StyledText>
            </XStack>
            <XStack
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              paddingVertical={4}
              borderRadius={32}>
              <XStack justifyContent="flex-start" alignItems="center" gap={1}>
                <StyledMIcon
                  name="access-time"
                  size={20}
                  color={theme.colors.gray[900]}
                />
                <StyledText
                  paddingHorizontal={4}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  color={theme.colors.gray[800]}>
                  {formatTimeFromDate(startDate)}
                </StyledText>
              </XStack>

              <XStack justifyContent="flex-start" alignItems="center" gap={1}>
                <StyledMIcon
                  name="access-time"
                  size={20}
                  color={theme.colors.gray[900]}
                />
                <StyledText
                  paddingHorizontal={4}
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  color={theme.colors.gray[800]}>
                  {formatTimeFromDate(endDate)}
                </StyledText>
              </XStack>
            </XStack>
            <XStack
              paddingVertical={8}
              justifyContent="flex-start"
              alignItems="center"
              gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.medium}
                color={theme.colors.gray[600]}>
                {description}
              </StyledText>
            </XStack>
            <StyledSeparator
              left={
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.normal}
                  color={theme.colors.gray[800]}>
                  Attactments({attachments.length})
                </StyledText>
              }
            />
            {attachments.map((item, index) => {
              return (
                <StyledCard
                  key={index}
                  borderRadius={16}
                  marginBottom={8}
                  borderColor={theme.colors.gray[200]}
                  backgroundColor={theme.colors.gray[1]}
                  borderWidth={1}>
                  <XStack
                    paddingVertical={8}
                    paddingHorizontal={8}
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}>
                    <XStack
                      justifyContent="flex-start"
                      alignItems="center"
                      gap={8}>
                      <FileIcon fileType={item.document_type} />
                      <StyledText
                        fontFamily={fontStyles.Roboto_Regular}
                        fontWeight={theme.fontWeight.normal}
                        fontSize={theme.fontSize.medium}
                        color={theme.colors.gray[600]}>
                        {item.document_name}
                      </StyledText>
                    </XStack>
                    <StyledCycle
                      height={32}
                      width={32}
                      borderColor={theme.colors.gray[300]}>
                      <FontAwesome
                        name="chevron-right"
                        size={12}
                        color={theme.colors.gray[600]}
                        onPress={() => handleDeepLink(item.secure_url)}
                      />
                    </StyledCycle>
                  </XStack>
                </StyledCard>
              );
            })}
            <StyledSeparator
              left={
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.normal}
                  color={theme.colors.gray[800]}>
                  Location
                </StyledText>
              }
            />
            <StyledCard
              borderRadius={16}
              marginBottom={8}
              borderColor={theme.colors.gray[200]}
              backgroundColor={theme.colors.gray[1]}
              borderWidth={1}>
              <FlexStyledImage
                local={true}
                borderRadius={8}
                borderWidth={5}
                borderColor={theme.colors.gray[100]}
                height={90}
                width={'100%'}
                imageUrl={require('../../../assets/img/map.png')}
              />
              <XStack
                justifyContent="flex-start"
                alignItems="center"
                paddingHorizontal={8}
                paddingVertical={8}
                flexWrap="wrap"
                gap={2}>
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.normal}
                  fontSize={theme.fontSize.small}
                  color={theme.colors.gray[800]}>
                  {project?.completeAddress}
                </StyledText>
              </XStack>
              <XStack
                justifyContent="flex-end"
                alignItems="center"
                paddingHorizontal={8}
                paddingVertical={8}
                flexWrap="wrap"
                gap={2}>
                <StyledButton
                  borderColor={theme.colors.blue[500]}
                  backgroundColor={theme.colors.blue[500]}
                  onPress={() => openGoogleMaps()}>
                  <XStack
                    justifyContent="flex-end"
                    alignItems="center"
                    paddingHorizontal={8}
                    flexWrap="wrap"
                    gap={1}>
                    <StyledText
                      fontFamily={fontStyles.Roboto_Regular}
                      fontWeight={theme.fontWeight.normal}
                      fontSize={theme.fontSize.small}
                      paddingLeft={4}
                      paddingVertical={10}
                      color={theme.colors.gray[1]}>
                      Routes
                    </StyledText>
                    <Icon
                      name="navigation"
                      size={25}
                      color={theme.colors.gray[1]}
                    />
                  </XStack>
                </StyledButton>
              </XStack>
            </StyledCard>
            <StyledSeparator
              left={
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.normal}
                  color={theme.colors.gray[800]}>
                  NearBy
                </StyledText>
              }
            />
            <XStack
              justifyContent="flex-start"
              alignItems="center"
              paddingHorizontal={8}
              flexWrap="wrap"
              gap={4}>
              <StyledButton
                borderColor={theme.colors.orange[500]}
                backgroundColor={theme.colors.orange[500]}
                onPress={() => openGoogleSearch()}>
                <XStack
                  justifyContent="flex-end"
                  alignItems="center"
                  paddingHorizontal={8}
                  flexWrap="wrap"
                  gap={1}>
                  <Icon name="hotel" size={25} color={theme.colors.gray[1]} />
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    paddingVertical={8}
                    color={theme.colors.gray[1]}>
                    Hotels
                  </StyledText>
                </XStack>
              </StyledButton>
              <StyledButton
                borderColor={theme.colors.pink[500]}
                backgroundColor={theme.colors.pink[500]}
                onPress={() => openGoogleMapsForTrainStations()}>
                <XStack
                  justifyContent="flex-end"
                  alignItems="center"
                  paddingHorizontal={8}
                  flexWrap="wrap"
                  gap={1}>
                  <Icon name="train" size={25} color={theme.colors.gray[1]} />
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    paddingVertical={8}
                    color={theme.colors.gray[1]}>
                    Train stations
                  </StyledText>
                </XStack>
              </StyledButton>
              <StyledButton
                borderColor={theme.colors.purple[500]}
                backgroundColor={theme.colors.purple[500]}
                onPress={() => openGoogleSearchNearByAirport()}>
                <XStack
                  justifyContent="flex-end"
                  alignItems="center"
                  paddingHorizontal={8}
                  flexWrap="wrap"
                  gap={1}>
                  <Icon
                    name="airline-seat-legroom-extra"
                    size={25}
                    color={theme.colors.gray[1]}
                  />
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    paddingVertical={8}
                    color={theme.colors.gray[1]}>
                    Airports
                  </StyledText>
                </XStack>
              </StyledButton>
            </XStack>
          </YStack>
        </StyledCard>
        <StyledCard
          borderRadius={16}
          flex={1}
          borderColor={theme.colors.gray[100]}
          backgroundColor={theme.colors.gray[100]}
          marginHorizontal={16}
          borderWidth={1}>
          <YStack
            justifyContent="flex-start"
            alignItems="start"
            paddingHorizontal={8}
            paddingVertical={8}>
            <XStack justifyContent="flex-start" alignItems="start">
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[600]}>
                Comments
              </StyledText>
              <StyledSpacer marginHorizontal={2} />
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.normal}
                fontSize={theme.fontSize.small}
                color={theme.colors.gray[800]}>
                ({comments.length})
              </StyledText>
            </XStack>
            <XStack justifyContent="flex-start" alignItems="center">
              <Icon
                name="account-circle"
                size={48}
                color={theme.colors.gray[300]}
              />
              <StyledSpacer marginHorizontal={3} />
              <XStack
                flex={1}
                justifyContent="flex-start"
                alignItems="center"
                borderColor={theme.colors.gray[100]}
                backgroundColor={theme.colors.gray[1]}
                borderRadius={32}
                paddingHorizontal={16}
                paddingVertical={8}>
                <Pressable onPress={handleShow}>
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    color={theme.colors.gray[400]}>
                    Add comments...
                  </StyledText>
                </Pressable>
              </XStack>
            </XStack>
          </YStack>
        </StyledCard>
      </ScrollView>
      <>
        <Modalize
          ref={modalizeRef}
          scrollViewProps={{showsVerticalScrollIndicator: false}}
          snapPoint={300}>
          <YStack
            paddingHorizontal={8}
            paddingVertical={16}
            backgroundColor={theme.colors.gray[100]}>
            {/* <XStack justifyContent="flex-end" alignItems="center">
              <Pressable onPress={handleClose}>
                <StyledCycle
                  height={48}
                  width={48}
                  borderColor={theme.colors.gray[800]}
                  backgroundColor={theme.colors.gray[800]}>
                  <Icon name="close" size={24} color={theme.colors.gray[1]} />
                </StyledCycle>
              </Pressable>
            </XStack> */}

            <KeyboardAvoidingView>
              <XStack flex={1}>
                <StyledSpacer marginHorizontal={2} />
                <StyledInput
                  flex={1}
                  keyboardType="default"
                  placeholder="write comments..."
                  returnKeyType="next"
                  maxLength={500}
                  fontSize={theme.fontSize.normal}
                  borderColor={theme.colors.gray[200]}
                  backgroundColor={theme.colors.gray[1]}
                  borderRadius={32}
                  paddingHorizontal={8}
                  value={fields.text}
                  placeholderTextColor={theme.colors.gray[300]}
                  onChangeText={text => handleChange('text', text)}
                  error={!!errorMessages?.text}
                />
                <StyledSpacer marginHorizontal={2} />
                <Pressable onPress={onSubmit}>
                  <StyledCycle
                    height={48}
                    width={48}
                    borderColor={theme.colors.gray[1]}
                    backgroundColor={theme.colors.gray[1]}>
                    <Icon
                      name="send"
                      size={24}
                      color={theme.colors.gray[600]}
                    />
                  </StyledCycle>
                </Pressable>
              </XStack>
            </KeyboardAvoidingView>
            <StyledSpacer marginTop={8} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {comments.map((item, index) => {
                return (
                  <Swipeable
                    key={item._id}
                    renderRightActions={() =>
                      renderRightActions(item._id, item.author?._id)
                    }>
                    <RenderComment item={item} key={index} />
                  </Swipeable>
                );
              })}
            </ScrollView>
          </YStack>
        </Modalize>
      </>
      {error && (
        <StyledOkDialog
          title={error?.message}
          description="please try again"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
      {success && (
        <StyledOkDialog
          title="Confirmation"
          description="Task status was updated successfully"
          visible={true}
          onOk={() => {
            handleReset();
          }}
        />
      )}
    </StyledSafeAreaView>
  );
};

export default Task;
