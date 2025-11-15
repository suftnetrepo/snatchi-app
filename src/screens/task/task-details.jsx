import React, { useState, useRef } from 'react';
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
  StyledOkDialog,
  StyledInput,
  StyledDialog,
} from 'fluent-styles';
import { theme } from '../../utils/theme';
import { fontStyles } from '../../utils/fontStyles';
import {
  Linking,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  FileIcon
} from '../../utils/help';
import { StyledMIcon } from '../../components/icon';
import TaskDropdown from '../../components/taskDropdown';
import { useTask } from '../../hooks/useTask';
import { Modalize } from 'react-native-modalize';
import { useTaskComments } from '../../hooks/useTaskComments';
import { validate } from '../../validator';
import { useAppContext } from '../../hooks/appContext';
import { Swipeable } from 'react-native-gesture-handler';
import ImageViewerWithZoom from '../../components/imageViewer';

const { width } = Dimensions.get('window');

const TaskDetails = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAppContext();
  const [visible, setVisible] = useState(true);
  const route = useRoute();
  const navigator = useNavigation();
  const [errorMessages, setErrorMessages] = useState({});
  const { handleEdit, handleReset, success, error } = useTask();
  const { task } = route.params;
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

  const onDelete = async id => {
    handleDelete(id).then(() => { });
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
            navigator.navigate("task")
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
        Task
      </StyledText>
      <StyledSpacer flex={1} />
      <StyledCycle
        height={48}
        width={48}
        borderColor={theme.colors.cyan[500]}
        backgroundColor={theme.colors.cyan[500]}>
        <Icon
          name="file-upload"
          size={24}
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

  const RenderComment = ({ item }) => (
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

  const NameInitialCircle = ({ name }) => {
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
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}>
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
                    await handleEdit({ status: value }, task._id);
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
                  <StyledSpacer marginVertical={8} />
            <XStack
              paddingVertical={1}
              justifyContent="flex-start"
              alignItems="center"
              gap={1}>
              <StyledText
                fontFamily={fontStyles.Roboto_Regular}
                fontWeight={theme.fontWeight.bold}
                fontSize={theme.fontSize.normal}
                color={theme.colors.gray[800]}>
                {name}
              </StyledText>
            </XStack>
            <XStack
              paddingVertical={1}
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
            
            <StyledSeparator
              left={
                <StyledText
                  fontFamily={fontStyles.Roboto_Regular}
                  fontWeight={theme.fontWeight.medium}
                  fontSize={theme.fontSize.normal}
                  color={theme.colors.gray[500]}>
                  Attactments ({attachments.length})
                </StyledText>
              }
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map((item, index) => {
                return (
                  <Pressable
                    key={index}
                    style={{ width: width - 32 }}
                    onPress={() => {
                      setModalVisible(true);
                      setSelectedImageIndex(index);
                    }}>
                    <StyledCard
                      borderRadius={16}
                      marginBottom={8}
                      marginHorizontal={8}
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
                            onPress={() => {
                              setModalVisible(true);
                              setSelectedImageIndex(index);
                            }}
                          />
                        </StyledCycle>
                      </XStack>
                    </StyledCard>
                  </Pressable>
                );
              })}
            </ScrollView>

          </YStack>
        </StyledCard>
        <StyledSpacer marginVertical={8} />
        <Pressable onPress={handleShow}>
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
                  <StyledText
                    fontFamily={fontStyles.Roboto_Regular}
                    fontWeight={theme.fontWeight.normal}
                    fontSize={theme.fontSize.small}
                    color={theme.colors.gray[400]}>
                    Add comments...
                  </StyledText>
                </XStack>
              </XStack>
            </YStack>
          </StyledCard>
        </Pressable>
      </ScrollView>
      <>
        <Modalize
          ref={modalizeRef}
          scrollViewProps={{ showsVerticalScrollIndicator: false }}
          snapPoint={300}>
          <YStack
            paddingHorizontal={8}
            paddingVertical={16}
            backgroundColor={theme.colors.gray[100]}>
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
      {modalVisible && (
        <StyledDialog visible>
          <ImageViewerWithZoom
            images={attachments.map(item => ({
              url: item.secure_url,
              description: item.document_name,
            }))}
            selectedIndex={selectedImageIndex}
            onClose={() => setModalVisible(false)}
          />
        </StyledDialog>
      )}
    </StyledSafeAreaView>
  );
};

export default TaskDetails;
